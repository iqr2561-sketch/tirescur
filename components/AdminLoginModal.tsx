import React, { useEffect, useState } from 'react';
import Modal from './Modal';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (credentials: { username: string; password: string }) => Promise<boolean> | boolean;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onAuthenticate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!username.trim() || !password.trim()) {
      setFormError('Completa usuario y contraseña.');
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await onAuthenticate({ username: username.trim(), password: password.trim() });
      if (success) {
        setUsername('');
        setPassword('');
      }
    } catch (error: any) {
      setFormError(error?.message || 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Acceso Administrativo">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Usuario
          </label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="admin"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="••••"
            disabled={isSubmitting}
          />
        </div>

        {formError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">{formError}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-red-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>
    </Modal>
  );
};

export default AdminLoginModal;


