import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Coins, Sparkles, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const COIN_PACKS = [
  { id: 'pebble', coins: 100, price: '0.99', label: 'Pebble Pack', color: '#ff8da1' },
  { id: 'crystal', coins: 500, price: '4.49', label: 'Crystal Cache', color: '#a58dff' },
  { id: 'royal', coins: 2000, price: '14.99', label: 'Royal Chest', color: '#ffd700' }
];

function Store() {
  const navigate = useNavigate();
  const [selectedPack, setSelectedPack] = useState(null);
  const token = localStorage.getItem('token');

  return (
    <div className="store-container">
      <div className="store-header">
         <button onClick={() => navigate(-1)} className="back-link"><ChevronLeft /> Back to Story</button>
         <div className="title-area">
            <Coins size={32} color="#ffd700" />
            <h1>ToonCoin Treasury</h1>
            <p>Unlock premium scenes and support creators</p>
         </div>
      </div>

      <div className="packs-grid">
        {COIN_PACKS.map(pack => (
          <div 
            key={pack.id} 
            className={`pack-card glass-morphism ${selectedPack?.id === pack.id ? 'active' : ''}`}
            onClick={() => setSelectedPack(pack)}
          >
            <div className="pack-icon" style={{ color: pack.color }}>
               {pack.id === 'royal' ? <Sparkles size={40} /> : <Coins size={32} />}
            </div>
            <h3>{pack.label}</h3>
            <div className="coin-amount">{pack.coins} Coins</div>
            <div className="price-tag">${pack.price}</div>
          </div>
        ))}
      </div>

      {selectedPack && (
        <div className="checkout-area glass-morphism motion-safe:animate-in fade-in slide-in-from-bottom-4">
           <div className="checkout-info">
              <span>Total: <strong>${selectedPack.price}</strong></span>
              <span>Credit: <strong>{selectedPack.coins} ToonCoins</strong></span>
           </div>
           
           <PayPalScriptProvider options={{ "client-id": "test", currency: "USD" }}>
              <PayPalButtons
                style={{ layout: "horizontal", color: "gold", shape: "pill", label: "pay" }}
                createOrder={async () => {
                  const res = await axios.post('/api/paypal/create-order', 
                    { amount: selectedPack.price },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  return res.data.id;
                }}
                onApprove={async (data) => {
                  await axios.post(`/api/paypal/capture-order/${data.orderID}`,
                    { coins: selectedPack.coins },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  alert('Coins added to your wallet!');
                  navigate('/');
                }}
              />
           </PayPalScriptProvider>
           
           <div className="secure-note">
              <ShieldCheck size={14} />
              <span>Secure transaction via PayPal</span>
           </div>
        </div>
      )}
    </div>
  );
}

export default Store;
