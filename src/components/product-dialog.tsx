import { useForm, Controller, Control, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, Product } from '@/schema/product';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { productTypes, productCategories } from '@/constants/productOptions';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@radix-ui/react-select';
import { toast } from 'sonner';
import { ProductModel } from '@/models/ProductModel';

// ====== Error Display Component ======
function FormError({ message }: { message?: string }) {
  return message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;
}

// ====== Form Field Component ======
function FormField<T extends Product>({
  label,
  id,
  type = 'text',
  defaultValue,
  disabled,
  options,
  control,
  name,
  ...register
}: {
  label: string;
  id: string;
  type?: string;
  defaultValue?: string | number | boolean;
  disabled?: boolean;
  options?: string[];
  control?: Control<T>;
  name?: Path<T>;
  [key: string]: any;
}) {
  if (options && control && name) {
    return (
      <div className="flex flex-col gap-3">
        <Label htmlFor={id}>{label}</Label>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Select
              onValueChange={(val) => {
                console.log('Selected value:', val);
                field.onChange(val);
              }}
              value={typeof field.value === 'string' ? field.value : field.value !== undefined && field.value !== null ? String(field.value) : ''}
            >
              <SelectTrigger
                id={id}
                className="w-full border rounded-md px-3 py-2 cursor-pointer"
              >
                <SelectValue placeholder={`Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        defaultValue={defaultValue as string | number}
        disabled={disabled}
        {...register}
      />
    </div>
  );
}

// ====== Main Component ======
export function AddProductDialog({ onAdd, data }: { onAdd: (product: Product) => void,  data: Product[]}) {
  const [open, setOpen] = useState(false);

  

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku_id: '',
      name: '',
      category: '',
      type: '',
      dimensions: '',
      weight: 0,
      material: '',
      strength: '',
      is_active: true,
      is_deprecated: false,
    },
  });

 const generateNextSKU = (data: Product[]) => {
  let maxNumber = 0;
  data.forEach((product) => {
    const match = product.sku_id.match(/^SKU(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  });
  const nextNumber = maxNumber + 1;
  const sku = `SKU${nextNumber.toString().padStart(3, '0')}`; // e.g., SKU008
  return sku;
};


  const onSubmit = async (values: Product) => {
    try {
      const now = new Date().toISOString();
      await onAdd({ ...values, created_at: now, updated_at: now });
      toast.success('Product added successfully!');
      setOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to add product. Please try again.');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const newSku = generateNextSKU(data);
      reset({
        sku_id: newSku,
        name: '',
        category: '',
        type: '',
        dimensions: '',
        weight: 0,
        material: '',
        strength: '',
        is_active: true,
        is_deprecated: false,
      });
      setValue('sku_id', newSku);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Fill all fields and click save.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
          <div>
            <FormField label="SKU ID" id="sku_id" disabled {...register('sku_id')} defaultValue={generateNextSKU(data)} />
            <FormError message={errors.sku_id?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormField label="Name" id="name" {...register('name')} />
              <FormError message={errors.name?.message} />
            </div>
            <div>
              <FormField label="Dimensions" id="dimensions" {...register('dimensions')} />
              <FormError message={errors.dimensions?.message} />
            </div>
            <div>
              <FormField label="Material" id="material" {...register('material')} />
              <FormError message={errors.material?.message} />
            </div>
            <div>
              <FormField label="Strength" id="strength" {...register('strength')} />
              <FormError message={errors.strength?.message} />
            </div>
            <div>
              <FormField
                label="Type"
                id="type"
                options={productTypes}
                control={control}
                name="type"
              />
              <FormError message={errors.type?.message} />
            </div>
            <div>
              <FormField
                label="Category"
                id="category"
                options={productCategories}
                control={control}
                name="category"
              />
              <FormError message={errors.category?.message} />
            </div>
          </div>
          <div>
            <FormField
              label="Weight"
              id="weight"
              type="number"
              step="0.01"
              {...register('weight', { valueAsNumber: true })}
            />
            <FormError message={errors.weight?.message} />
          </div>
          <div className="flex items-center gap-6">
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <label htmlFor="is_active" className="flex items-center gap-2">
                  <Checkbox
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Active
                </label>
              )}
            />
            <Controller
              control={control}
              name="is_deprecated"
              render={({ field }) => (
                <label htmlFor="is_deprecated" className="flex items-center gap-2">
                  <Checkbox
                    id="is_deprecated"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Deprecated
                </label>
              )}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}