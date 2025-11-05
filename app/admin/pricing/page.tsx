'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePricing } from '@/hooks/usePricing';

export default function PricingManagement() {
  const { user } = useAuth();
  const { tiers, loading, addTier, updateTier, deleteTier } = usePricing(user?.uid || null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      duration: 30,
      price: 0,
      description: '',
    });
    setIsAdding(false);
    setEditingTier(null);
  };

  const handleAddTier = async () => {
    if (!user) return;

    try {
      await addTier({
        merchantId: user.uid,
        name: formData.name,
        duration: formData.duration,
        price: formData.price,
        description: formData.description,
        isActive: true,
      });
      resetForm();
    } catch (error) {
      console.error('Error adding tier:', error);
    }
  };

  const handleEditTier = (tier: any) => {
    setEditingTier(tier.id);
    setFormData({
      name: tier.name,
      duration: tier.duration,
      price: tier.price,
      description: tier.description,
    });
    setIsAdding(true);
  };

  const handleUpdateTier = async () => {
    if (!editingTier) return;

    try {
      await updateTier(editingTier, {
        name: formData.name,
        duration: formData.duration,
        price: formData.price,
        description: formData.description,
      });
      resetForm();
    } catch (error) {
      console.error('Error updating tier:', error);
    }
  };

  const toggleTierStatus = async (tierId: string, currentStatus: boolean) => {
    try {
      await updateTier(tierId, { isActive: !currentStatus });
    } catch (error) {
      console.error('Error updating tier status:', error);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (confirm('Are you sure you want to delete this pricing tier?')) {
      try {
        await deleteTier(tierId);
      } catch (error) {
        console.error('Error deleting tier:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Pricing Management</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
        >
          Add Pricing Tier
        </button>
      </div>

      {/* Add/Edit Tier Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              {editingTier ? 'Edit Pricing Tier' : 'Add Pricing Tier'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Consultation"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                  }
                  min="15"
                  step="15"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the service"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingTier ? handleUpdateTier : handleAddTier}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {editingTier ? 'Update Tier' : 'Add Tier'}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tiers Grid */}
      {tiers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No Pricing Tiers Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first pricing tier to start accepting bookings
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      tier.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {tier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-4xl font-bold mb-2">${tier.price}</div>
                <div className="text-gray-600 dark:text-gray-400">{tier.duration} minutes</div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                {tier.description}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleEditTier(tier)}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-medium transition"
                >
                  Edit
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTierStatus(tier.id, tier.isActive)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      tier.isActive
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {tier.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
