import React, { useState } from 'react';
import Modal from './Modal';

interface CustomerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerName: string) => void;
}

const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [nameError, setNameError] = useState('');
  const [surnameError, setSurnameError] = useState('');

  const handleConfirm = () => {
    let hasError = false;
    if (!name.trim()) {
      setNameError('El nombre es obligatorio.');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!surname.trim()) {
      setSurnameError('El apellido es obligatorio.');
      hasError = true;
    } else {
      setSurnameError('');
    }

    if (!hasError) {
      onConfirm(`${name.trim()} ${surname.trim()}`);
      setName('');
      setSurname('');
      onClose();
    }
  };

  const handleCloseModal = () => {
    setName('');
    setSurname('');
    setNameError('');
    setSurnameError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Confirmar Pedido">
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-200">Por favor, introduce tu nombre y apellido para completar el pedido.</p>
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Nombre<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="customerName"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
              bg-white text-gray-900 placeholder:text-gray-500
              dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600
              ${nameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'}`}
            value={name}
            onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
            onBlur={() => { if (!name.trim()) setNameError('El nombre es obligatorio.'); }}
            placeholder="Tu nombre"
            aria-required="true"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? "name-error" : undefined}
          />
          {nameError && <p id="name-error" className="mt-1 text-sm text-red-500">{nameError}</p>}
        </div>
        <div>
          <label htmlFor="customerSurname" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Apellido<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="customerSurname"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
              bg-white text-gray-900 placeholder:text-gray-500
              dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600
              ${surnameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'}`}
            value={surname}
            onChange={(e) => { setSurname(e.target.value); if (surnameError) setSurnameError(''); }}
            onBlur={() => { if (!surname.trim()) setSurnameError('El apellido es obligatorio.'); }}
            placeholder="Tu apellido"
            aria-required="true"
            aria-invalid={!!surnameError}
            aria-describedby={surnameError ? "surname-error" : undefined}
          />
          {surnameError && <p id="surname-error" className="mt-1 text-sm text-red-500">{surnameError}</p>}
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-6 border-t mt-6
                  border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleCloseModal}
          className="py-2 px-4 border rounded-md transition-colors focus:outline-none focus:ring-2
                     border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300
                     dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
        >
          Confirmar Pedido
        </button>
      </div>
    </Modal>
  );
};

export default CustomerInfoModal;