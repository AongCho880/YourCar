
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Phone, TrendingUp, BarChart3 as BarChart3Icon } from 'lucide-react'; // Renamed to avoid conflict
import { useState, useEffect } from 'react';

// Mock data - in a real app, this would come from a backend/analytics service
const mockWebsiteVisitsData = [
  { name: 'Jan', visits: 400 },
  { name: 'Feb', visits: 300 },
  { name: 'Mar', visits: 500 },
  { name: 'Apr', visits: 450 },
  { name: 'May', visits: 600 },
  { name: 'Jun', visits: 550 },
  { name: 'Jul', visits: 700 },
];

const mockContactChannelData = [
  { name: 'WhatsApp', contacts: 120 },
  { name: 'Messenger', contacts: 85 },
];

// Example: Top Performing Cars (mocked)
const mockTopCarData = [
    { name: 'Toyota Camry', views: 2500, contacts: 50 },
    { name: 'Honda Civic', views: 2200, contacts: 45 },
    { name: 'Ford F-150', views: 1800, contacts: 30 },
    { name: 'BMW 3 Series', views: 1750, contacts: 25 },
    { name: 'Tesla Model 3', views: 2800, contacts: 60 },
];

export default function AdminStatisticsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return null or a basic skeleton for SSR to avoid hydration mismatch with charts
    // This is important because Recharts relies on browser APIs.
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="animate-pulse rounded-md bg-muted h-10 w-3/4"></div> {/* Skeleton for Title */}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-lg bg-muted h-32"></div> 
                ))}
            </div>
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-lg bg-muted h-80"></div> 
                ))}
            </div>
            <div className="animate-pulse rounded-lg bg-muted h-60"></div>
            <div className="animate-pulse rounded-lg bg-muted h-40"></div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center">
          <BarChart3Icon className="mr-3 h-8 w-8 text-primary" />
          Site & Engagement Statistics
        </h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Website Visits</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,250</div>
            <p className="text-xs text-muted-foreground">+15% from last month (Mock Data)</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Contacts</CardTitle>
            <Phone className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockContactChannelData.find(c => c.name === 'WhatsApp')?.contacts || 0}</div>
            <p className="text-xs text-muted-foreground">+20 since last week (Mock Data)</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messenger Contacts</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockContactChannelData.find(c => c.name === 'Messenger')?.contacts || 0}</div>
            <p className="text-xs text-muted-foreground">+5 since last week (Mock Data)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Website Visits Over Time</CardTitle>
            <CardDescription>Monthly unique visits to the website. (Mock Data)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockWebsiteVisitsData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                <Legend wrapperStyle={{fontSize: "12px"}}/>
                <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6, fill: 'hsl(var(--primary))' }} dot={{ r:3, fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Contact Channel Breakdown</CardTitle>
            <CardDescription>Number of contacts initiated via each platform. (Mock Data)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockContactChannelData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                <Legend wrapperStyle={{fontSize: "12px"}}/>
                <Bar dataKey="contacts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Top Performing Car Listings (Example)
          </CardTitle>
          <CardDescription>
            Showing mock data for car views and contacts. Real integration would require tracking these metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-3 text-left font-medium text-muted-foreground">Car Model</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Views</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Contacts Initiated</th>
                </tr>
              </thead>
              <tbody>
                {mockTopCarData.map((car) => (
                  <tr key={car.name} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">{car.name}</td>
                    <td className="p-3">{car.views}</td>
                    <td className="p-3">{car.contacts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-card border-border/30">
        <CardHeader>
            <CardTitle className="text-primary text-lg">Developer Note: Data Integration</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm space-y-2">
            <p>
                The statistics displayed on this page are currently using <strong>mock data</strong>.
                To show real-time analytics, you'll need to integrate with an analytics service (for website visits)
                and implement tracking for contact button clicks (e.g., by logging events to Supabase when WhatsApp/Messenger buttons are clicked).
            </p>
            <p>
                Consider services like Google Analytics for site traffic and custom Supabase tables for tracking specific user interactions
                like contact initiations or car detail page views.
            </p>
        </CardContent>
      </Card>

    </div>
  );
}

