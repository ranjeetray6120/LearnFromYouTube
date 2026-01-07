import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: -1,
            background: 'var(--bg-gradient)'
        }}>
            {/* Floating Blobs */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(110, 231, 183, 0.2)',
                    filter: 'blur(80px)',
                    borderRadius: '50%'
                }}
            />

            <motion.div
                animate={{
                    x: [0, -70, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '10%',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(167, 139, 250, 0.2)', // Purple haze
                    filter: 'blur(100px)',
                    borderRadius: '50%'
                }}
            />

            <motion.div
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, -30, 30, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    filter: 'blur(120px)',
                    borderRadius: '50%'
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
