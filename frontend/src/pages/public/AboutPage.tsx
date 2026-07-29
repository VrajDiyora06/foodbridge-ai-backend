import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">About FoodBridge AI</h1>
        <p className="text-slate-500 text-sm">Empowering zero-food-waste ecosystems with intelligent logistics.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-600 leading-relaxed space-y-4">
        <p>
          FoodBridge AI is designed to automate food donation matching and streamline claims between food business donors and verified NGOs.
        </p>
      </div>
    </div>
  );
};
