
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Complaint } from '@/types';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, query, orderBy, doc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Inbox, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      if (!db) throw new Error("Firestore not initialized");
      const complaintsCollection = collection(db, 'complaints');
      const q = query(complaintsCollection, orderBy('submittedAt', 'desc'));
      const complaintSnapshot = await getDocs(q);
      const complaintsList = complaintSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toMillis() : data.submittedAt || Date.now(),
        } as Complaint;
      });
      setComplaints(complaintsList);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error Loading Complaints", description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const toggleResolveStatus = async (complaint: Complaint) => {
    if (!db) {
        toast({ variant: "destructive", title: "Database Error", description: "Firestore not initialized."});
        return;
    }
    setUpdatingId(complaint.id);
    try {
        const complaintRef = doc(db, "complaints", complaint.id);
        await updateDoc(complaintRef, {
            isResolved: !complaint.isResolved,
            updatedAt: serverTimestamp()
        });
        toast({ title: "Success", description: `Complaint status updated.` });
        // Refresh data
        setComplaints(prev => prev.map(c => c.id === complaint.id ? {...c, isResolved: !c.isResolved} : c));
    } catch (error) {
        console.error("Error updating complaint status:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Update Failed", description: errorMessage });
    } finally {
        setUpdatingId(null);
    }
  };


  if (loading && complaints.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="border rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Submitted At</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="text-right w-[120px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Customer Complaints</h1>
      {complaints.length === 0 && !loading ? (
         <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Complaints Yet</h2>
          <p className="text-muted-foreground">Looks like all customers are happy for now!</p>
        </div>
      ) : (
        <div className="border rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow>
                <TableHead className="w-[200px]">Submitted At</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="min-w-[300px]">Details</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="text-right w-[120px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>{format(new Date(complaint.submittedAt), 'MMM d, yyyy HH:mm')}</TableCell>
                  <TableCell>{complaint.name || 'N/A'}</TableCell>
                  <TableCell>{complaint.email || 'N/A'}</TableCell>
                  <TableCell className="max-w-md truncate" title={complaint.details}>{complaint.details}</TableCell>
                  <TableCell>
                    <Badge variant={complaint.isResolved ? 'default' : 'secondary'}>
                      {complaint.isResolved ? 'Resolved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleResolveStatus(complaint)}
                        disabled={updatingId === complaint.id}
                    >
                        {updatingId === complaint.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {complaint.isResolved ? 'Mark Unresolved' : 'Mark Resolved'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
