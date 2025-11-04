import React, { useState, useCallback, useEffect } from 'react';
import { AdminUser } from '../types';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

interface AdminUsersManagementPageProps {
  onAddUser?: (user: Omit<AdminUser, 'id'>) => Promise<void>;
  onUpdateUser?: (user: AdminUser) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
}

const AdminUsersManagementPage: React.FC<AdminUsersManagementPageProps> = ({
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    display_name: string;
    role: 'admin' | 'editor' | 'viewer';
    is_active: boolean;
  }>({
    username: '',
    password: '',
    display_name: '',
    role: 'admin',
    is_active: true,
  });

  const { showSuccess, showError, showWarning } = useToast();

  const API_BASE_URL = '/api';

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      showError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      display_name: '',
      role: 'admin',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = useCallback((user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // No mostrar la contraseña existente
      display_name: user.display_name || '',
      role: user.role,
      is_active: user.is_active,
    });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      showWarning('El nombre de usuario es obligatorio.');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      showWarning('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    try {
      if (editingUser) {
        // Actualizar usuario
        const updatePayload: any = {
          id: editingUser.id,
          username: formData.username.trim(),
          display_name: formData.display_name.trim() || formData.username.trim(),
          role: formData.role,
          is_active: formData.is_active,
        };

        if (formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }

        const res = await fetch(`${API_BASE_URL}/users`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Error al actualizar el usuario');
        }

        const updatedUser = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        showSuccess('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        const res = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username.trim(),
            password: formData.password.trim(),
            display_name: formData.display_name.trim() || formData.username.trim(),
            role: formData.role,
            is_active: formData.is_active,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Error al crear el usuario');
        }

        const newUser = await res.json();
        setUsers((prev) => [newUser, ...prev]);
        showSuccess('Usuario creado correctamente');
      }

      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving user:', err);
      showError(err?.message || 'Error al guardar el usuario');
    }
  }, [formData, editingUser, showSuccess, showError, showWarning]);

  const handleDeleteUser = useCallback(async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al eliminar el usuario');
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      showSuccess('Usuario eliminado correctamente');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showError(err?.message || 'Error al eliminar el usuario');
    }
  }, [showSuccess, showError]);

  const getInputFieldClasses = () => `
    mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500
    bg-white text-gray-900 placeholder:text-gray-500
    dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600
  `;

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Usuarios</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Añadir Nuevo Usuario</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.display_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : user.role === 'editor'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : user.role === 'editor' ? 'Editor' : 'Visualizador'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Nombre de Usuario *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={getInputFieldClasses()}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={getInputFieldClasses()}
              required={!editingUser}
            />
          </div>

          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Nombre para Mostrar
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="Nombre completo o apodo"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={getInputFieldClasses()}
            >
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="viewer">Visualizador</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
              Usuario activo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {editingUser ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsersManagementPage;

