import React from 'react';
import { motion } from 'framer-motion';
import UrlScanner from '../components/UrlScanner';

const UrlScanPage = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-5xl w-[94%] mx-auto h-full flex flex-col pt-24"
        >
            <div className="mb-8 overflow-visible">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">
                    Intelligent URL Analysis
                </h2>
                <p className="text-lavender/80 mt-2">Scan domains and endpoints against 70+ threat engines via VirusTotal.</p>
            </div>
            <UrlScanner />
        </motion.div>
    );
};

export default UrlScanPage;
