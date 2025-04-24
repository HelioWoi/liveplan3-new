import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async () => {
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setError(error.message);

    alert('Senha alterada com sucesso!');
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Redefinir senha</h2>
      <input
        type="password"
        placeholder="Nova senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-2"
      />
      <input
        type="password"
        placeholder="Confirmar nova senha"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="border p-2 mb-2"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleReset} className="bg-purple-600 text-white p-2 px-4 rounded">
        Atualizar senha
      </button>
    </div>
  );
}
