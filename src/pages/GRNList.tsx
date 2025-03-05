
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  where, 
  DocumentData,
  QueryDocumentSnapshot 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GRN } from "@/types/grn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { 
  Truck, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardList, 
  FileSearch,
  PackageOpen,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {Notifications} from "@/utils/notifications.ts";

const ITEMS_PER_PAGE = 10;

const GRNList = () => {
  const navigate = useNavigate();
  const [grns, setGrns] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchGRNs = async (direction: 'next' | 'prev' | 'first' = 'first') => {
    setLoading(true);
    
    try {
      let grnQuery;
      
      if (searchQuery) {
        if (direction === 'first') {
          grnQuery = query(
            collection(db, "grns"),
            where("grnNumber", ">=", searchQuery),
            where("grnNumber", "<=", searchQuery + "\uf8ff"),
            orderBy("grnNumber", "asc"),
            limit(ITEMS_PER_PAGE)
          );
        } else if (direction === 'next' && lastVisible) {
          grnQuery = query(
            collection(db, "grns"),
            where("grnNumber", ">=", searchQuery),
            where("grnNumber", "<=", searchQuery + "\uf8ff"),
            orderBy("grnNumber", "asc"),
            startAfter(lastVisible),
            limit(ITEMS_PER_PAGE)
          );
        } else if (direction === 'prev' && firstVisible) {
          // This is a simplified approach, a more complete one would use a backward query
          grnQuery = query(
            collection(db, "grns"),
            where("grnNumber", ">=", searchQuery),
            where("grnNumber", "<=", searchQuery + "\uf8ff"),
            orderBy("grnNumber", "asc"),
            limit(ITEMS_PER_PAGE)
          );
        } else {
          grnQuery = query(
            collection(db, "grns"),
            where("grnNumber", ">=", searchQuery),
            where("grnNumber", "<=", searchQuery + "\uf8ff"),
            orderBy("grnNumber", "asc"),
            limit(ITEMS_PER_PAGE)
          );
        }
      } else {
        // Default query for all GRNs
        if (direction === 'first') {
          grnQuery = query(
            collection(db, "grns"),
            orderBy("receivedDate", "desc"),
            limit(ITEMS_PER_PAGE)
          );
        } else if (direction === 'next' && lastVisible) {
          grnQuery = query(
            collection(db, "grns"),
            orderBy("receivedDate", "desc"),
            startAfter(lastVisible),
            limit(ITEMS_PER_PAGE)
          );
        } else if (direction === 'prev' && firstVisible) {
          // This is a simplified approach, a more complete one would use a backward query
          const prevPage = Math.max(1, page - 1);
          const skipCount = (prevPage - 1) * ITEMS_PER_PAGE;
          
          grnQuery = query(
            collection(db, "grns"),
            orderBy("receivedDate", "desc"),
            limit(ITEMS_PER_PAGE)
          );
          
          if (skipCount > 0) {
            const tempQuery = query(
              collection(db, "grns"),
              orderBy("receivedDate", "desc"),
              limit(skipCount + ITEMS_PER_PAGE)
            );
            
            const tempSnapshot = await getDocs(tempQuery);
            const tempDocs = tempSnapshot.docs;
            
            if (tempDocs.length > skipCount) {
              const startAtDoc = tempDocs[skipCount];
              grnQuery = query(
                collection(db, "grns"),
                orderBy("receivedDate", "desc"),
                startAfter(startAtDoc),
                limit(ITEMS_PER_PAGE)
              );
            }
          }
        } else {
          grnQuery = query(
            collection(db, "grns"),
            orderBy("receivedDate", "desc"),
            limit(ITEMS_PER_PAGE)
          );
        }
      }
      
      // Get total count for pagination info
      const countQuery = query(collection(db, "grns"));
      const countSnapshot = await getDocs(countQuery);
      setTotalCount(countSnapshot.size);
      
      // Get the actual data
      const snapshot = await getDocs(grnQuery);
      const fetchedGRNs: GRN[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as Record<string, any>;
        
        // Check if receivedDate exists and convert it properly
        let receivedDate: Date;
        if (data.receivedDate) {
          // Explicitly checking and handling the receivedDate property
          receivedDate = data.receivedDate.toDate ? 
            data.receivedDate.toDate() : 
            new Date(data.receivedDate);
        } else {
          receivedDate = new Date(); // Default to current date if missing
        }
          
        fetchedGRNs.push({ 
          id: doc.id,
          ...data as Omit<GRN, 'id' | 'receivedDate'>,
          receivedDate
        });
      });
      
      if (snapshot.docs.length > 0) {
        setFirstVisible(snapshot.docs[0]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
      } else {
        setFirstVisible(null);
        setLastVisible(null);
        setHasMore(false);
      }
      
      setGrns(fetchedGRNs);
      
      if (direction === 'next') {
        setPage(page + 1);
      } else if (direction === 'prev') {
        setPage(Math.max(1, page - 1));
      } else {
        setPage(1);
      }
      
    } catch (error) {
      console.error("Error fetching GRNs:", error);
      Notifications.error("Failed to fetch GRN records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchGRNs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGRNs('first');
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchGRNs('first');
  };

  // Calculate total cost of a GRN
  const getTotalCost = (grn: GRN) => {
    return grn.items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Truck className="h-6 w-6 text-green-600" />
        <h1 className="text-3xl font-semibold text-green-800 dark:text-green-300">GRN Records</h1>
        <div className="ml-auto">
          <Button
            onClick={() => navigate("/grn")}
            className="bg-green-600 hover:bg-green-700"
          >
            <PackageOpen className="mr-2 h-4 w-4" />
            New GRN
          </Button>
        </div>
      </div>
      
      <Card className="shadow-md mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Search GRN Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by GRN number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {searchQuery && (
              <Button type="button" variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            GRN List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-green-50 dark:bg-green-900/10">
                <TableRow>
                  <TableHead>GRN Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead>Total Items</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : grns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No GRN records found. {searchQuery && "Try a different search term or"} create a new GRN.
                    </TableCell>
                  </TableRow>
                ) : (
                  grns.map((grn) => (
                    <TableRow key={grn.id} className="hover:bg-green-50/50 dark:hover:bg-green-900/10">
                      <TableCell className="font-medium">{grn.grnNumber}</TableCell>
                      <TableCell>{grn.supplierName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-green-600" />
                          {formatDate(grn.receivedDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {grn.items.length} items
                        </Badge>
                      </TableCell>
                      <TableCell>${getTotalCost(grn).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedGRN(grn)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl flex items-center gap-2">
                                <Truck className="h-5 w-5 text-green-600" />
                                GRN #{grn.grnNumber}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedGRN && (
                              <Tabs defaultValue="items" className="mt-4">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="items">Items</TabsTrigger>
                                  <TabsTrigger value="details">GRN Details</TabsTrigger>
                                </TabsList>
                                <TabsContent value="items" className="pt-4">
                                  <Table>
                                    <TableHeader className="bg-green-50 dark:bg-green-900/10">
                                      <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Cost Price</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedGRN.items.map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell className="font-medium">{item.productName}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>${item.costPrice.toFixed(2)}</TableCell>
                                          <TableCell>${(item.quantity * item.costPrice).toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                                        <TableCell colSpan={3} className="text-right font-medium">
                                          Total Cost:
                                        </TableCell>
                                        <TableCell className="font-bold text-green-700 dark:text-green-400">
                                          ${getTotalCost(selectedGRN).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TabsContent>
                                <TabsContent value="details" className="pt-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Supplier Name</h3>
                                      <p className="text-lg">{selectedGRN.supplierName}</p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Received Date</h3>
                                      <p className="text-lg">{formatDate(selectedGRN.receivedDate)}</p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Created By</h3>
                                      <p className="text-lg">{selectedGRN.createdBy}</p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Items</h3>
                                      <p className="text-lg">{selectedGRN.items.length}</p>
                                    </div>
                                  </div>
                                  
                                  {selectedGRN.notes && (
                                    <div className="mt-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                                      <div className="p-3 bg-muted rounded-md">
                                        <p>{selectedGRN.notes}</p>
                                      </div>
                                    </div>
                                  )}
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing page {page} of {Math.ceil(totalCount / ITEMS_PER_PAGE) || 1}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => fetchGRNs('prev')}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fetchGRNs('next')}
                disabled={!hasMore || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GRNList;
