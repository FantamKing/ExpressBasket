import React, { useState, useEffect } from 'react';
import FaceCapture from './FaceCapture';
import axios from '../../utils/axios';
import './FaceRecognitionLogin.css';
import { X, Scan, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';

/**
 * FaceRecognitionLogin - Uses optimized client-side face recognition
 * 
 * The client-side approach using FaceCapture.jsx is reliable and works well
 * after the following optimizations:
 * - 20 FPS detection (instead of 60)
 * - Reduced webcam resolution (480x360)
 * - Model caching in browser
 */
const FaceRecognitionLogin = ({ isOpen, onClose, onLoginSuccess }) => {
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, recognizing, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [attemptCount, setAttemptCount] = useState(0);
    const MAX_ATTEMPTS = 5;

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setFaceDescriptor(null);
            setStatus('idle');
            setErrorMessage('');
            setAttemptCount(0);
        }
    }, [isOpen]);

    const handleFaceDetected = async (descriptor) => {
        if (status === 'recognizing' || attemptCount >= MAX_ATTEMPTS) return;

        setFaceDescriptor(descriptor);
        setStatus('recognizing');
        setAttemptCount(prev => prev + 1);

        try {
            // Call backend API to match face (sends descriptor, not image)
            const response = await axios.post('/admin/face-recognition/auth/face-login', {
                faceDescriptor: descriptor
            });

            const data = response.data;
            console.log('✅ Face login API response:', data);

            if (data.token) {
                console.log('✅ Token received, setting success status...');
                setStatus('success');
                setTimeout(() => {
                    console.log('✅ Calling onLoginSuccess with data...');
                    onLoginSuccess(data);
                }, 1000);
            } else {
                setStatus('error');
                setErrorMessage(data.message || 'Face not recognized. Please try again.');

                // Reset after 2 seconds to allow retry
                setTimeout(() => {
                    if (attemptCount < MAX_ATTEMPTS - 1) {
                        setStatus('idle');
                        setErrorMessage('');
                    } else {
                        setErrorMessage('Maximum attempts reached. Please use password login.');
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Face login error:', error);
            console.error('Error response:', error.response?.data);
            setStatus('error');

            // Axios throws on non-2xx responses, so we need to extract the message from error.response
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.hint ||
                error.message ||
                'Face not recognized. Please try again.';
            setErrorMessage(errorMsg);

            setTimeout(() => {
                if (attemptCount < MAX_ATTEMPTS - 1) {
                    setStatus('idle');
                    setErrorMessage('');
                }
            }, 2000);
        }
    };

    const handleError = (error) => {
        setStatus('error');
        setErrorMessage(error);
    };

    if (!isOpen) return null;

    return (
        <div className="face-recognition-modal-overlay" onClick={onClose}>
            <div className="face-recognition-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Scan className="title-icon" size={28} />
                        <h2>Face Recognition Login</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {attemptCount < MAX_ATTEMPTS ? (
                        <>
                            <FaceCapture
                                onFaceDetected={handleFaceDetected}
                                onError={handleError}
                                mode="login"
                            />

                            {status === 'recognizing' && (
                                <div className="recognition-status recognizing">
                                    <div className="spinner-large"></div>
                                    <p>Recognizing your face...</p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="recognition-status success">
                                    <CheckCircle size={48} className="status-icon-animated" />
                                    <p>Face recognized! Logging in...</p>
                                </div>
                            )}

                            {status === 'error' && errorMessage && (
                                <div className="recognition-status error">
                                    <XCircle size={48} className="status-icon-animated" />
                                    <p>{errorMessage}</p>
                                    {attemptCount < MAX_ATTEMPTS && (
                                        <p className="attempt-count">
                                            Attempt {attemptCount} of {MAX_ATTEMPTS}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="max-attempts-reached">
                            <AlertTriangle size={64} className="warning-icon-animated" />
                            <h3>Maximum Attempts Reached</h3>
                            <p>Please use password login instead.</p>
                            <button className="btn-primary" onClick={onClose}>
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <p className="security-note">
                        <Lock size={16} />
                        Your face data is encrypted and secure
                    </p>
                    <button className="btn-secondary" onClick={onClose}>
                        Use Password Instead
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FaceRecognitionLogin;
