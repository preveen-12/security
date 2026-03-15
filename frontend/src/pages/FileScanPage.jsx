import React from 'react';
import { motion } from 'framer-motion';
import FileScanner from '../components/FileScanner';

const FileScanPage = () => {
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
                    Sandbox File Analysis
                </h2>
                <p className="text-lavender/80 mt-2">Upload suspicious files to a simulated isolated environment for behavioral analytics.</p>
            </div>
            <FileScanner />
        </motion.div>
    );
};

export default FileScanPage;
