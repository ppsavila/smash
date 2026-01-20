// Notifications management module with Firebase Firestore

import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    limit
} from 'firebase/firestore';
import { db, auth as firebaseAuth } from '../firebase.js';

export const notifications = {
    // Create a new notification
    async create(notificationData) {
        try {
            // notificationData: { userId (target), title, message, type, link, fromUserId, read: false, createdAt }
            await addDoc(collection(db, 'notifications'), {
                ...notificationData,
                read: false,
                createdAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('Error creating notification:', error);
            return { success: false, error: 'Erro ao criar notificação' };
        }
    },

    // Subscribe to user's notifications
    subscribe(callback) {
        const user = firebaseAuth.currentUser;
        if (!user) return () => { };

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        return onSnapshot(q, (snapshot) => {
            const notifs = [];
            snapshot.forEach((doc) => {
                notifs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(notifs);
        });
    },

    // Mark notification as read
    async markAsRead(id) {
        try {
            const docRef = doc(db, 'notifications', id);
            await updateDoc(docRef, { read: true });
            return { success: true };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false };
        }
    }
};
