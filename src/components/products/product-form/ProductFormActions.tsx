
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";

interface ProductFormActionsProps {
  loading: boolean;
  saving: "save" | "saveAndNew" | null;
  setSaving: React.Dispatch<React.SetStateAction<"save" | "saveAndNew" | null>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const ProductFormActions: React.FC<ProductFormActionsProps> = ({
  loading,
  saving,
  setSaving,
  handleSubmit,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/products")}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={() => {
          setSaving("saveAndNew");
          handleSubmit(new Event('submit') as any);
        }}
        disabled={loading}
        variant="outline"
        className="border-primary text-primary hover:bg-primary/10"
      >
        {loading && saving === "saveAndNew" ? (
          <>
            <span className="mr-2">Saving...</span>
            <span className="animate-spin">⌛</span>
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4"/>
            Save &amp; New
          </>
        )}
      </Button>
      <Button
        type="submit"
        onClick={() => setSaving("save")}
        disabled={loading}
        className="bg-primary hover:bg-primary/80"
      >
        {loading && saving === "save" ? (
          <>
            <span className="mr-2">Saving...</span>
            <span className="animate-spin">⌛</span>
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4"/>
            Save Product
          </>
        )}
      </Button>
    </div>
  );
};
