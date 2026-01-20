// Authentication module with Firebase

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '../firebase.js';
import { uploadProfilePhoto } from '../utils/upload.js';

// Current user cache
let currentUserCache = null;

// Listen to auth state changes
onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
    if (firebaseUser) {
        try {
            // User is signed in, get additional data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
                currentUserCache = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    ...userDoc.data()
                };
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallback: use basic auth data if Firestore fails
            currentUserCache = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'Usuário'
            };
        }
    } else {
        // User is signed out
        currentUserCache = null;
    }
});

export const auth = {
    // Register a new user
    async register(email, password, name, photoFile) {
        try {
            // Validate inputs
            if (!email || !password || !name) {
                return { success: false, error: 'Todos os campos são obrigatórios' };
            }

            if (password.length < 6) {
                return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
            }

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            const user = userCredential.user;

            // Upload photo if provided
            let photoURL = null;
            if (photoFile) {
                try {
                    photoURL = await uploadProfilePhoto(photoFile, user.uid);
                } catch (uploadError) {
                    console.error('Failed to upload profile photo:', uploadError);
                    // Continue without photo to ensure account is created
                }
            }

            // Update Firebase Auth profile
            await updateProfile(user, {
                displayName: name,
                photoURL: photoURL
            });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
                photoURL,
                createdAt: new Date().toISOString()
            });

            // Update cache
            currentUserCache = {
                id: user.uid,
                email,
                name,
                photoURL,
                createdAt: new Date().toISOString()
            };

            return {
                success: true,
                user: currentUserCache
            };
        } catch (error) {
            console.error('Registration error:', error);

            // Handle Firebase errors
            if (error.code === 'auth/email-already-in-use') {
                return { success: false, error: 'Este email já está cadastrado' };
            } else if (error.code === 'auth/invalid-email') {
                return { success: false, error: 'Email inválido' };
            } else if (error.code === 'auth/weak-password') {
                return { success: false, error: 'Senha muito fraca' };
            }

            return { success: false, error: 'Erro ao criar conta. Tente novamente.' };
        }
    },

    // Login user
    async login(email, password) {
        try {
            if (!email || !password) {
                return { success: false, error: 'Email e senha são obrigatórios' };
            }

            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            const user = userCredential.user;

            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (!userDoc.exists()) {
                return { success: false, error: 'Dados do usuário não encontrados' };
            }

            const userData = {
                id: user.uid,
                email: user.email,
                ...userDoc.data()
            };

            currentUserCache = userData;

            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);

            if (error.code === 'auth/invalid-credential' ||
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/wrong-password') {
                return { success: false, error: 'Email ou senha incorretos' };
            } else if (error.code === 'auth/too-many-requests') {
                return { success: false, error: 'Muitas tentativas. Tente novamente mais tarde.' };
            }

            return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
        }
    },

    // Logout user
    async logout() {
        try {
            await signOut(firebaseAuth);
            currentUserCache = null;
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Erro ao fazer logout' };
        }
    },

    // Get current logged in user
    getCurrentUser() {
        return currentUserCache;
    },

    // Update user profile
    async updateProfile(updates) {
        try {
            const user = firebaseAuth.currentUser;

            if (!user) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            const { name, photoFile, instagram, phone, shareInstagram, sharePhone } = updates;
            let photoURL = currentUserCache?.photoURL;

            // Upload new photo if provided
            if (photoFile) {
                photoURL = await uploadProfilePhoto(photoFile, user.uid);
            }

            // Update Firebase Auth profile
            const profileUpdates = {};
            if (name) profileUpdates.displayName = name;
            if (photoURL) profileUpdates.photoURL = photoURL;

            if (Object.keys(profileUpdates).length > 0) {
                await updateProfile(user, profileUpdates);
            }

            // Update Firestore document
            const firestoreUpdates = {
                updatedAt: new Date().toISOString()
            };
            if (name) firestoreUpdates.name = name;
            if (photoURL) firestoreUpdates.photoURL = photoURL;
            if (instagram !== undefined) firestoreUpdates.instagram = instagram;
            if (phone !== undefined) firestoreUpdates.phone = phone;
            if (shareInstagram !== undefined) firestoreUpdates.shareInstagram = shareInstagram;
            if (sharePhone !== undefined) firestoreUpdates.sharePhone = sharePhone;

            await updateDoc(doc(db, 'users', user.uid), firestoreUpdates);

            // Update cache
            currentUserCache = {
                ...currentUserCache,
                name: name || currentUserCache.name,
                photoURL: photoURL || currentUserCache.photoURL,
                instagram: instagram !== undefined ? instagram : currentUserCache.instagram,
                phone: phone !== undefined ? phone : currentUserCache.phone,
                shareInstagram: shareInstagram !== undefined ? shareInstagram : currentUserCache.shareInstagram,
                sharePhone: sharePhone !== undefined ? sharePhone : currentUserCache.sharePhone
            };

            return { success: true, user: currentUserCache };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: 'Erro ao atualizar perfil' };
        }
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!firebaseAuth.currentUser;
    },

    // Wait for auth to initialize and profile to load
    waitForAuth() {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                if (user) {
                    // User is signed in, wait for profile cache to be populated
                    const checkCache = setInterval(() => {
                        if (currentUserCache) {
                            clearInterval(checkCache);
                            unsubscribe();
                            resolve(user);
                        }
                    }, 50);

                    // Safety timeout (e.g. if firestore fails)
                    setTimeout(() => {
                        clearInterval(checkCache);
                        if (!currentUserCache) {
                            // Fallback
                            currentUserCache = { id: user.uid, email: user.email, name: user.displayName || 'User' };
                        }
                        unsubscribe();
                        resolve(user);
                    }, 3000);
                } else {
                    unsubscribe();
                    resolve(null);
                }
            });
        });
    }
};
