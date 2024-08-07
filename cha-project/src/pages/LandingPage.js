// src/pages/LandingPage.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './LandingPage.css';
import '../styles/fonts.css'

const LandingPage = () => {
    const [dividerPosition, setDividerPosition] = useState(window.innerWidth / 2);
    const sliderRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (sliderRef.current) {
            const newDividerPosition = e.clientX;
            if (newDividerPosition > 0 && newDividerPosition < window.innerWidth) {
                setDividerPosition(newDividerPosition);
            }
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = () => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div className="container-fluid px-0">
            <div className="img-compare position-relative">
                <div
                    id="left"
                    className="col-left transition"
                    style={{ width: dividerPosition }}
                >
                    <div className='img-text'>
                        <p style={{ fontSize: 45, fontFamily: "felgine" }}>
                            Government
                        </p>
                        <p style={{ fontSize: 30, fontFamily: "felgine" }}>
                            Military, Army, Police, Navy Uniforms
                            etc.
                        </p>
                    </div>
                    <img className='darken-image'
                        src={require('../assets/Government.png')}
                        alt="Government"
                    />

                </div>
                <div
                    ref={sliderRef}
                    className="divider-handle"
                    style={{ left: dividerPosition }}
                    onMouseDown={handleMouseDown}
                >
                    <button className="divider-button">||</button>
                </div>
                <div
                    id="right"
                    className="col-right transition"
                    style={{ width: `calc(100% - ${dividerPosition}px)` }}
                >
                    <div className='img-text'>
                        <h1>
                            Corporate
                        </h1>
                        <p>
                            Business, Retail,
                            Construction, Restaurant,
                            Uniforms etc.
                        </p>
                    </div>
                    <img className='darken-image'
                        src={require('../assets/Corporate.png')}
                        alt="Corporate"
                    />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
