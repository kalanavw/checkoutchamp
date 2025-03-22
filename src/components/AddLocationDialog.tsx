import React, {useState} from 'react';
import {PlusCircle} from 'lucide-react';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {warehouseService} from "@/services/WarehouseService.ts";
import {Notifications} from "@/utils/notifications.ts";
import {Warehouse} from "@/types/warehouse.ts";

interface AddLocationDialogProps {
    onLocationAdded: (locationId: string) => void;
}

const AddLocationDialog: React.FC<AddLocationDialogProps> = ({onLocationAdded}) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !code.trim()) {
            Notifications.error("Name and code are required")
            return;
        }

        setIsSubmitting(true);

        try {
            const newLocation: Warehouse = await warehouseService.createWareHouse({
                name: name.trim(),
                code: code.trim(),
                description: description.trim()
            });

            if (newLocation) {
                // Call callback with the new location ID
                onLocationAdded(newLocation.id);
                // Reset form
                setName('');
                setCode('');
                setDescription('');
                // Close dialog
                setOpen(false);
            }
        } catch (error) {
            console.error('Error creating location:', error);
            toast.error('Failed to create location');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <PlusCircle size={16}/>
                    Add Warehouse
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Add New Warehouse</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="required">Name <span
                                style={{color: "red"}}>*</span></Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Warehouse name"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code" className="required">Code <span
                                style={{color: "red"}}>*</span></Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="WH-01"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Warehouse description"
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Warehouse'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddLocationDialog;