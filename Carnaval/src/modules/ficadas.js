// Ficadas management module with Firebase Firestore

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db, auth as firebaseAuth } from '../firebase.js';
import { uploadFicadaPhoto, deletePhoto } from '../utils/upload.js';

export const ficadas = {
    // Get all ficadas for current user
    async getAll() {
        try {
            const user = firebaseAuth.currentUser;
            if (!user) return [];

            const q = query(
                collection(db, 'ficadas'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const ficadasList = [];

            querySnapshot.forEach((doc) => {
                ficadasList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return ficadasList;
        } catch (error) {
            console.error('Error getting ficadas:', error);
            return [];
        }
    },

    // Get ficada by ID
    async getById(id) {
        try {
            const docRef = doc(db, 'ficadas', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting ficada:', error);
            return null;
        }
    },

    // Create new ficada
    async create(ficadaData) {
        try {
            const user = firebaseAuth.currentUser;
            if (!user) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            // Validate
            if (!ficadaData.name) {
                return { success: false, error: 'Nome é obrigatório' };
            }

            // Create ficada document first to get ID
            const docRef = await addDoc(collection(db, 'ficadas'), {
                userId: user.uid,
                targetUserId: ficadaData.targetUserId || null,
                name: ficadaData.name,
                instagram: ficadaData.instagram || '',
                phone: ficadaData.phone || '',
                comment: ficadaData.comment || '',
                photoURL: ficadaData.photoURL || null,
                createdAt: new Date().toISOString()
            });

            // Upload photo if provided
            let photoURL = null;
            if (ficadaData.photoFile) {
                photoURL = await uploadFicadaPhoto(ficadaData.photoFile, docRef.id);

                // Update document with photo URL
                await updateDoc(docRef, { photoURL });
            }

            // Trigger notification if target user exists
            if (ficadaData.targetUserId) {
                try {
                    const { notifications } = await import('./notifications.js');
                    await notifications.create({
                        userId: ficadaData.targetUserId, // Target user
                        fromUserId: user.uid,            // Current user
                        fromUserName: user.displayName || ficadaData.name, // Name of current user
                        type: 'reciprocate',
                        title: 'Nova Conexão!',
                        message: `${user.displayName || 'Alguém'} te adicionou. Conecte de volta!`,
                        link: `/connect/${user.uid}`
                    });
                } catch (notifError) {
                    console.error('Failed to trigger notification:', notifError);
                    // Don't fail the main action
                }
            }

            const newFicada = {
                id: docRef.id,
                userId: user.uid,
                name: ficadaData.name,
                instagram: ficadaData.instagram || '',
                phone: ficadaData.phone || '',
                photoURL,
                createdAt: new Date().toISOString()
            };

            return { success: true, ficada: newFicada };
        } catch (error) {
            console.error('Error creating ficada:', error);
            return { success: false, error: 'Erro ao criar ficada' };
        }
    },

    // Update ficada
    async update(id, updates) {
        try {
            const user = firebaseAuth.currentUser;
            if (!user) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            // Get existing ficada to verify ownership
            const ficada = await this.getById(id);
            if (!ficada || ficada.userId !== user.uid) {
                return { success: false, error: 'Ficada não encontrada' };
            }

            // Prepare updates
            const firestoreUpdates = {
                updatedAt: new Date().toISOString()
            };

            if (updates.name !== undefined) firestoreUpdates.name = updates.name;
            if (updates.instagram !== undefined) firestoreUpdates.instagram = updates.instagram;
            if (updates.phone !== undefined) firestoreUpdates.phone = updates.phone;

            // Upload new photo if provided
            if (updates.photoFile) {
                // Delete old photo if exists
                if (ficada.photoURL) {
                    await deletePhoto(ficada.photoURL);
                }

                const photoURL = await uploadFicadaPhoto(updates.photoFile, id);
                firestoreUpdates.photoURL = photoURL;
            }

            // Update document
            const docRef = doc(db, 'ficadas', id);
            await updateDoc(docRef, firestoreUpdates);

            // Get updated ficada
            const updatedFicada = await this.getById(id);

            return { success: true, ficada: updatedFicada };
        } catch (error) {
            console.error('Error updating ficada:', error);
            return { success: false, error: 'Erro ao atualizar ficada' };
        }
    },

    // Delete ficada
    async delete(id) {
        try {
            const user = firebaseAuth.currentUser;
            if (!user) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            // Get ficada to verify ownership and get photo URL
            const ficada = await this.getById(id);
            if (!ficada || ficada.userId !== user.uid) {
                return { success: false, error: 'Ficada não encontrada' };
            }

            // Delete photo if exists
            if (ficada.photoURL) {
                await deletePhoto(ficada.photoURL);
            }

            // Delete document
            await deleteDoc(doc(db, 'ficadas', id));

            return { success: true };
        } catch (error) {
            console.error('Error deleting ficada:', error);
            return { success: false, error: 'Erro ao excluir ficada' };
        }
    }
};
