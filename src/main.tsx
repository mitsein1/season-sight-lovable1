import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SeasonaxProvider } from '@/context/SeasonaxContext';

createRoot(document.getElementById("root")!).render(<App />);
