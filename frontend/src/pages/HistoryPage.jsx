import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScanHistory from '../components/ScanHistory';
import api from '../api';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/scans/history');
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-5xl w-[95%] mx-auto h-full flex flex-col pt-24 pb-10"
        >
            <div className="mb-8 overflow-visible">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">
                    Investigation History
                </h2>
                <p className="text-white text-lg mt-2">Review your past intelligence scans and threat assessments.</p>
            </div>

            {loading ? (
                <div className="flex-1 flex justify-center items-center">
                    <div className="w-8 h-8 border-4 border-violet dark:border-lavender border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="flex-1 min-h-[500px]">
                    <ScanHistory scans={history} />
                </div>
            )}
        </motion.div>
    );
};

export default HistoryPage;
