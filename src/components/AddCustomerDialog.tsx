import React, {useState} from 'react'
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {customerService} from "@/services/CustomerService.ts";
import {Notifications} from "@/utils/notifications.ts";

interface AddCustomerDialogProps {
    onCustomerAdded: (customerName: string) => void;
}

const AddCustomerDialog: React.FC<AddCustomerDialogProps> = ({onCustomerAdded}) => {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [customerData, setCustomerData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'retail' as 'retail' | 'wholesale'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setCustomerData((prev) => ({...prev, [name]: value}))
    }

    const handleTypeChange = (value: 'retail' | 'wholesale') => {
        setCustomerData((prev) => ({...prev, type: value}))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customerData.name || !customerData.phone) {
            Notifications.error("Name and phone are required");
            return
        }

        try {
            setIsSubmitting(true);
            const newCustomer = await customerService.createCustomer(customerData);
            Notifications.success(`${newCustomer.name} has been added successfully`);
            onCustomerAdded(newCustomer.name);
            setOpen(false);
            setCustomerData({
                name: '',
                email: '',
                phone: '',
                type: 'retail'
            });
        } catch (error) {
            Notifications.error("Failed to create customer")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    + New Customer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                        Create a new customer to add to your invoice
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={customerData.name}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={customerData.email}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={customerData.phone}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type</Label>
                            <RadioGroup
                                value={customerData.type}
                                onValueChange={(value: 'retail' | 'wholesale') => handleTypeChange(value)}
                                className="col-span-3 flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="retail" id="retail"/>
                                    <Label htmlFor="retail">Retail</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="wholesale" id="wholesale"/>
                                    <Label htmlFor="wholesale">Wholesale</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Customer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddCustomerDialog