import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { system } from '../system';
import * as THREE from 'three';
import './LoginSignUp.css';

const LoginSignUp = () => {
  const [activeTab, setActiveTab] = useState('login');
  const threeContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesMeshRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Initialize Three.js
    if (threeContainerRef.current && THREE) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75, 
        threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight, 
        0.1, 
        1000
      );
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
      });
      
      renderer.setSize(
        threeContainerRef.current.clientWidth, 
        threeContainerRef.current.clientHeight
      );
      renderer.setClearColor(0x000000, 0);
      threeContainerRef.current.appendChild(renderer.domElement);

      // Create particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 150;
      const posArray = new Float32Array(particlesCount * 3);

      for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x667eea,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      // Create rotating rings
      const ringGeometry = new THREE.TorusGeometry(3, 0.05, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x764ba2,
        transparent: true,
        opacity: 0.3
      });
      const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
      const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
      ring1.rotation.x = Math.PI / 4;
      ring2.rotation.y = Math.PI / 4;
      scene.add(ring1, ring2);

      camera.position.z = 5;

      // Store references
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      particlesMeshRef.current = particlesMesh;
      ring1Ref.current = ring1;
      ring2Ref.current = ring2;

      // Animation
      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      document.addEventListener('mousemove', handleMouseMove);

      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);

        if (particlesMeshRef.current) {
          particlesMeshRef.current.rotation.y += 0.001;
          particlesMeshRef.current.rotation.x += 0.0005;
        }

        if (ring1Ref.current && ring2Ref.current) {
          ring1Ref.current.rotation.z += 0.005;
          ring2Ref.current.rotation.z -= 0.003;
        }

        if (cameraRef.current) {
          cameraRef.current.position.x += (mouseX * 0.5 - cameraRef.current.position.x) * 0.05;
          cameraRef.current.position.y += (mouseY * 0.5 - cameraRef.current.position.y) * 0.05;
          cameraRef.current.lookAt(sceneRef.current.position);
        }

        renderer.render(scene, camera);
      };

      animate();

      // Handle window resize
      const handleResize = () => {
        if (threeContainerRef.current && threeContainerRef.current.clientWidth > 0) {
          camera.aspect = threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(
            threeContainerRef.current.clientWidth, 
            threeContainerRef.current.clientHeight
          );
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (threeContainerRef.current && renderer.domElement) {
          threeContainerRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    }
  }, []);

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('email'); // email field is used as username/rollno
    const password = formData.get('password');

    try {
      const res = await system.login(username, password);
      if (res && res.success) {
        const user = res.user;
        if (user && user.role) {
          if (user.role === 'admin') navigate('/admin');
          else if (user.role === 'teacher') navigate('/teacher');
          else navigate('/student');
        } else {
          navigate('/');
        }
      } else {
        alert(res.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to connect to server. Please try again.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role').toLowerCase(); // normalize role case
    const rollNo = formData.get('rollNo');

    if (!['admin', 'teacher', 'student'].includes(role)) {
      alert('Role must be Admin, Teacher or Student');
      return;
    }

    // Validate roll number for students
    if (role === 'student' && !rollNo) {
      alert('Roll number is required for students');
      return;
    }

    const result = await system.signup(email, password, fullName, role, rollNo);
    if (result.success) {
      alert('Account created! Please login.');
      setActiveTab('login');
    } else {
      alert(result.message || 'Failed to create account');
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="bg-animated"></div>
      
      <div className="container">
        <div className="auth-wrapper">
          {/* Form Side */}
          <div className="form-side">
            <div className="logo-section">
              <div className="logo-box">📱</div>
              <div className="logo-text">Attendy</div>
            </div>

            <h1 className="form-title">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="form-subtitle">
              Revolutionizing attendance with smart QR technology
            </p>

            <div className="tab-switcher">
              <button 
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
                type="button"
              >
                Login
              </button>
              <button 
                className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
                type="button"
              >
                Sign Up
              </button>
            </div>

            {/* Login Form */}
            <form 
              onSubmit={handleLoginSubmit}
              className={activeTab === 'login' ? '' : 'hidden'}
            >
              <div className="input-group">
                <label htmlFor="loginEmail" className="input-label">
                  Email Address
                </label>
                <input 
                  id="loginEmail"
                  name="email"
                  type="email" 
                  className="input-field" 
                  placeholder="you@example.com" 
                  required 
                />
              </div>
              <div className="input-group">
                <label htmlFor="loginPassword" className="input-label">
                  Password
                </label>
                <input 
                  id="loginPassword"
                  name="password"
                  type="password" 
                  className="input-field" 
                  placeholder="Enter your password" 
                  required 
                />
              </div>
              <button type="submit" className="submit-btn">
                <span className="relative z-10">Sign In to Dashboard</span>
              </button>
            </form>

            {/* Signup Form */}
            <form 
              onSubmit={handleSignupSubmit}
              className={activeTab === 'signup' ? '' : 'hidden'}
            >
              <div className="input-group">
                <label htmlFor="signupName" className="input-label">
                  Full Name
                </label>
                <input 
                  id="signupName"
                  name="fullName"
                  type="text" 
                  className="input-field" 
                  placeholder="John Doe" 
                  required 
                />
              </div>
              <div className="input-group">
                <label htmlFor="signupEmail" className="input-label">
                  Email Address
                </label>
                <input 
                  id="signupEmail"
                  name="email"
                  type="email" 
                  className="input-field" 
                  placeholder="you@example.com" 
                  required 
                />
              </div>
              <div className="input-group">
                <label htmlFor="signupPassword" className="input-label">
                  Password
                </label>
                <input 
                  id="signupPassword"
                  name="password"
                  type="password" 
                  className="input-field" 
                  placeholder="Create strong password" 
                  required 
                />
              </div>
              <div className="input-group">
                <label htmlFor="signupRole" className="input-label">
                  Select Role
                </label>
                <select
                  id="signupRole"
                  name="role"
                  className="input-field"
                  required
                  onChange={(e) => {
                    // Show/hide roll number field based on role selection
                    const rollNoField = document.getElementById('rollNoField');
                    if (rollNoField) {
                      rollNoField.style.display = e.target.value.toLowerCase() === 'student' ? 'block' : 'none';
                    }
                  }}
                >
                  <option value="" style={{color:"black"}}>Select a role</option>
                  <option value="Student" style={{color:"black"}}>Student</option>
                  <option value="Teacher"style={{color:"black"}}>Teacher</option>
                  <option value="Admin" style={{color:"black"}}>Admin</option>
                </select>
              </div>
              <div id="rollNoField" className="input-group" style={{ display: 'none' }}>
                <label htmlFor="signupRollNo" className="input-label">
                  Roll Number
                </label>
                <input 
                  id="signupRollNo"
                  name="rollNo"
                  type="text" 
                  className="input-field" 
                  placeholder="Enter your roll number" 
                />
              </div>
              <button type="submit" className="submit-btn">
                <span className="relative z-10">Create Account</span>
              </button>
            </form>
          </div>

          {/* Animation Side */}
          <div className="animation-side">
            <div ref={threeContainerRef} id="threejs-container"></div>
            
            <div className="floating-elements">
              <div className="float-orb orb1"></div>
              <div className="float-orb orb2"></div>
              <div className="float-orb orb3"></div>
            </div>

            <div className="qr-scanner">
              <div className="qr-box">
                <div className="corner-decoration corner-tl"></div>
                <div className="corner-decoration corner-tr"></div>
                <div className="corner-decoration corner-bl"></div>
                <div className="corner-decoration corner-br"></div>
                <div className="scan-effect"></div>
                <div className="qr-grid">
                  {/* QR Code Grid Pattern */}
                  {[...Array(64)].map((_, index) => {
                    const transparentPixels = [9, 10, 13, 14, 17, 22, 25, 27, 28, 30, 31, 33, 34, 38, 39, 41, 42, 45, 46, 49, 50, 53, 54, 57, 58, 61, 62];
                    return (
                      <div
                        key={index}
                        className="qr-pixel"
                        style={{
                          background: transparentPixels.includes(index) 
                            ? 'transparent' 
                            : '#000'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignUp;