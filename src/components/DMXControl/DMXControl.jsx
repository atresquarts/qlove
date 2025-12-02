import { useState } from 'react';
import { Zap, ZapOff, Send } from 'lucide-react';
import { useFixtures } from '../../context/FixtureContext';
import { Button } from '../ui/Button';
import './DMXControl.css';

export function DMXControl() {
  const { dmxConnected, dmxDevice, connectDMX, disconnectDMX, sendToDMX } = useFixtures();
  const [isSending, setIsSending] = useState(false);

  const handleConnect = async () => {
    try {
      await connectDMX();
    } catch (error) {
      // Error is handled in context with toast
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectDMX();
    } catch (error) {
      // Error is handled in context with toast
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      await sendToDMX();
    } catch (error) {
      // Error is handled in context with toast
    } finally {
      setTimeout(() => setIsSending(false), 1000);
    }
  };

  return (
    <div className="dmx-control">
      {!dmxConnected ? (
        <Button variant="outline" size="icon" onClick={handleConnect} title="Conectar DMX">
          <ZapOff size={20} />
        </Button>
      ) : (
        <div className="dmx-control-connected">
          <div className="dmx-status" title="DMX Conectado">
            <div className="dmx-status-indicator" />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleSend}
            disabled={isSending}
            className={isSending ? 'dmx-sending' : ''}
            title={isSending ? 'Enviando...' : 'Enviar a DMX'}
          >
            <Send size={20} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDisconnect} title="Desconectar DMX">
            <ZapOff size={20} />
          </Button>
        </div>
      )}
    </div>
  );
}
