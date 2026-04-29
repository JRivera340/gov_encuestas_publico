import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Bienvenido a Vecino Buena Pata
        </h1>
        <p className="text-gray-600 text-lg">
          Plataforma de encuestas ciudadanas
        </p>
      </div>
    </div>
  );
};

export default HomePage;
