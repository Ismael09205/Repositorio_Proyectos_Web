import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat/Chat'
import Done from './pages/Done/Done'


function App(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/chat" element={<Chat />} />
                <Route path="/done" element={<Done />} />
            </Routes>
        </BrowserRouter>
    )
}