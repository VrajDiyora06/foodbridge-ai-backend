import React from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, MapPin, Clock, Image, Leaf } from 'lucide-react';
import type { CreateFoodInput, FoodItem } from '../types/donor.types';

const foodSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'cooked_meals',
    'fresh_produce',
    'bakery',
    'packaged_food',
    'beverages',
    'dairy',
    'canned_goods',
    'other',
  ]),
  quantityAmount: z.coerce.number().min(1, 'Amount must be at least 1'),
  quantityUnit: z.string().min(1, 'Unit is required'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  expiresAt: z.string().min(1, 'Expiry date is required'),
  pickupStartTime: z.string().min(1, 'Pickup start time is required'),
  pickupEndTime: z.string().min(1, 'Pickup end time is required'),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isHalal: z.boolean().optional(),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type FoodFormData = z.infer<typeof foodSchema>;

interface DonationFormProps {
  initialData?: FoodItem;
  isSubmitting?: boolean;
  onSubmit: (data: CreateFoodInput) => Promise<void>;
}

export const DonationForm: React.FC<DonationFormProps> = ({
  initialData,
  isSubmitting = false,
  onSubmit,
}) => {
  const defaultValues: Partial<FoodFormData> = initialData
    ? {
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        quantityAmount: initialData.quantity.amount,
        quantityUnit: initialData.quantity.unit,
        address: initialData.location.address,
        city: initialData.location.city,
        state: initialData.location.state || '',
        zipCode: initialData.location.zipCode || '',
        expiresAt: new Date(initialData.expiresAt).toISOString().slice(0, 16),
        pickupStartTime: new Date(initialData.pickupWindow.startTime).toISOString().slice(0, 16),
        pickupEndTime: new Date(initialData.pickupWindow.endTime).toISOString().slice(0, 16),
        isVegetarian: initialData.isVegetarian,
        isVegan: initialData.isVegan,
        isHalal: initialData.isHalal,
        imageUrl: initialData.imageUrl || '',
      }
    : {
        category: 'cooked_meals',
        quantityUnit: 'servings',
        isVegetarian: false,
        isVegan: false,
        isHalal: false,
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FoodFormData>({
    resolver: zodResolver(foodSchema) as Resolver<FoodFormData>,
    defaultValues,
  });

  const handleFormSubmit = async (formData: FoodFormData) => {
    const payload: CreateFoodInput = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      quantity: {
        amount: formData.quantityAmount,
        unit: formData.quantityUnit,
      },
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
      expiresAt: new Date(formData.expiresAt).toISOString(),
      pickupWindow: {
        startTime: new Date(formData.pickupStartTime).toISOString(),
        endTime: new Date(formData.pickupEndTime).toISOString(),
      },
      isVegetarian: formData.isVegetarian,
      isVegan: formData.isVegan,
      isHalal: formData.isHalal,
      imageUrl: formData.imageUrl || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      {/* Basic Details Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Basic Food Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Food Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Freshly Baked Croissants & Sandwiches"
              {...register('title')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            {errors.title && <p className="text-xs text-rose-500 font-medium mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
            >
              <option value="cooked_meals">Cooked Meals</option>
              <option value="fresh_produce">Fresh Produce</option>
              <option value="bakery">Bakery Items</option>
              <option value="packaged_food">Packaged Food</option>
              <option value="beverages">Beverages</option>
              <option value="dairy">Dairy</option>
              <option value="canned_goods">Canned Goods</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                min="1"
                placeholder="10"
                {...register('quantityAmount')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500"
              />
              {errors.quantityAmount && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.quantityAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Unit *
              </label>
              <input
                type="text"
                placeholder="servings, kg, boxes"
                {...register('quantityUnit')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500"
              />
              {errors.quantityUnit && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.quantityUnit.message}</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Food Description & Preparation Notes *
            </label>
            <textarea
              rows={3}
              placeholder="Describe the items, packaging details, and any storage requirements..."
              {...register('description')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            {errors.description && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Timing & Expiry Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          2. Expiry & Pickup Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Food Expiry Date & Time *
            </label>
            <input
              type="datetime-local"
              {...register('expiresAt')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500"
            />
            {errors.expiresAt && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.expiresAt.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Pickup Start Time *
            </label>
            <input
              type="datetime-local"
              {...register('pickupStartTime')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500"
            />
            {errors.pickupStartTime && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.pickupStartTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Pickup End Time *
            </label>
            <input
              type="datetime-local"
              {...register('pickupEndTime')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500"
            />
            {errors.pickupEndTime && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.pickupEndTime.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          3. Pickup Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              placeholder="123 Main Street, Suite 400"
              {...register('address')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500"
            />
            {errors.address && <p className="text-xs text-rose-500 font-medium mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              City *
            </label>
            <input
              type="text"
              placeholder="San Francisco"
              {...register('city')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500"
            />
            {errors.city && <p className="text-xs text-rose-500 font-medium mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Zip Code
            </label>
            <input
              type="text"
              placeholder="94105"
              {...register('zipCode')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Dietary Options & Image Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-600" />
          4. Dietary Tags & Image URL
        </h3>

        <div className="flex flex-wrap items-center gap-6 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              {...register('isVegetarian')}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            Vegetarian
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              {...register('isVegan')}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            Vegan
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              {...register('isHalal')}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            Halal
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5 text-slate-400" />
            Image URL (Optional)
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            {...register('imageUrl')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500"
          />
          {errors.imageUrl && <p className="text-xs text-rose-500 font-medium mt-1">{errors.imageUrl.message}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving Listing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {initialData ? 'Update Food Listing' : 'Publish Food Listing'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
