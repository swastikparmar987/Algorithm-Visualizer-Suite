import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Gallery from './components/Gallery';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}

export default App;
