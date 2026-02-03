import React, { useState } from 'react';
import botilitoMascot from '../assets/botilito-mascot.png';

export const MigrationPopup = () => {
  const [isOpen, setIsOpen] = useState(true);

  const closePopup = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <>
      <div 
        id="botilito-migration-overlay" 
        style={{
          display: 'block', 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          zIndex: 9998, 
          backdropFilter: 'blur(4px)'
        }}
        onClick={closePopup}
      ></div>

      <div 
        id="botilito-migration-popup" 
        style={{
          display: 'block', 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%,-50%)', 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
          zIndex: 9999, 
          width: '90%', 
          maxWidth: '420px', 
          overflow: 'hidden'
        }}
      >
        
        {/* Header amarillo */}
        <div style={{
          background: 'linear-gradient(135deg,#FFC107 0%,#FFB300 50%,#FFA000 100%)', 
          padding: '24px', 
          textAlign: 'center', 
          position: 'relative'
        }}>
          {/* Círculo con Botilito */}
          <div style={{
            position: 'absolute', 
            top: '-20px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            width: '80px', 
            height: '80px', 
            backgroundColor: 'white', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
            border: '3px solid #FFC107', 
            overflow: 'hidden'
          }}>
            <img 
              src={botilitoMascot} 
              alt="Botilito" 
              style={{
                width: '60px', 
                height: '60px', 
                objectFit: 'contain'
              }} 
            />
          </div>
          <div style={{marginTop: '50px'}}>
            <h2 style={{
              color: '#1a1a1a', 
              fontSize: '20px', 
              fontWeight: 'bold', 
              margin: 0
            }}>¡Nueva Versión Disponible!</h2>
          </div>
        </div>

        {/* Contenido */}
        <div style={{padding: '24px', textAlign: 'center'}}>
          <p style={{
            color: '#374151', 
            fontSize: '15px', 
            lineHeight: 1.6, 
            margin: '0 0 20px 0'
          }}>
            Usted se encuentra en la <strong>versión 1 (alfa)</strong> de la Plataforma Web de Botilito.
          </p>
          <p style={{
            color: '#374151', 
            fontSize: '15px', 
            lineHeight: 1.6, 
            margin: '0 0 20px 0'
          }}>
            Ya se encuentra activa la <strong>versión 2 (beta)</strong> y puede ingresarse a través del siguiente enlace:
          </p>

          {/* Badge URL */}
          <div style={{
            display: 'inline-block', 
            background: 'linear-gradient(135deg,#FFF8E1 0%,#FFECB3 100%)', 
            border: '2px solid #FFC107', 
            borderRadius: '30px', 
            padding: '12px 24px', 
            marginBottom: '24px'
          }}>
            <span style={{
              color: '#E65100', 
              fontWeight: 'bold', 
              fontSize: '16px'
            }}>🔗 botilito2.digitalia.gov.co</span>
          </div>

          {/* Botones */}
          <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
            <button 
              onClick={closePopup} 
              style={{
                padding: '12px 24px', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb', 
                backgroundColor: 'white', 
                color: '#374151', 
                fontSize: '14px', 
                fontWeight: 500, 
                cursor: 'pointer'
              }}
            >
              Continuar aquí
            </button>
            <button 
              onClick={() => window.open('https://botilito2.digitalia.gov.co','_blank')} 
              style={{
                padding: '12px 24px', 
                borderRadius: '8px', 
                border: 'none', 
                background: 'linear-gradient(135deg,#FFC107 0%,#FF9800 100%)', 
                color: '#1a1a1a', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                boxShadow: '0 4px 12px rgba(255,193,7,0.4)'
              }}
            >
              Ir a versión 2 →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
