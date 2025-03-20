'use client'
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createClient } from '@/utils/supabase/client';
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/app/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { cn } from '@/lib/utils';
import MultiSelect from "@/app/components/MultiSelect";
import BuildsFilters from "@/app/components/BuildsFilters";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import BuildsSearchBar from '@/app/components/BuildsSearchBar';
import { create } from 'domain';
import DeleteRoutineButton from '@/app/components/DeleteRoutineButton';
import { useUser } from '../context/user-provider';

type Comments = {
  [userId: string]: string[];
};

type SkinRoutine = {
  id: number;
  skin_type: string[];
  skin_concerns: string[];
  climate: string[];
  likes_id: string[];
  shareable_id: string;
  routine_name: string;
  day_products: Array<{
    id: number;
    name: string;
    type: string;
    routine: string;
    imageUrl: string;
  }>;
  night_products: Array<{
    id: number;
    name: string;
    type: string;
    routine: string;
    imageUrl: string;
  }>;
  routine_description: string;
  comments: Comments;
  owner_user_id: string;
  display_name?: string;
  avatar_url?: string;
  user_id?: string;
};

type FilterOption = {
  value: string;
  label: string;
};

const skinTypes: FilterOption[] = [
  { value: "oily", label: "Oily" },
  { value: "dry", label: "Dry" },
  { value: "combination", label: "Combination" },
  { value: "normal", label: "Normal" },
  { value: "sensitive", label: "Sensitive" },
];

const climateTypes: FilterOption[] = [
  { value: "tropical", label: "Tropical" },
  { value: "dry", label: "Dry" },
  { value: "temperate", label: "Temperate" },
  { value: "cold", label: "Cold" },
];

const skinConcerns: FilterOption[] = [
  { value: "acne", label: "Acne" },
  { value: "aging", label: "Aging" },
  { value: "pigmentation", label: "Pigmentation" },
  { value: "sensitivity", label: "Sensitivity" },
  { value: "dryness", label: "Dryness" },
];


export default function CommunityBuilds() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const [routines, setRoutines] = useState<SkinRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch routines when search term changes
  useEffect(() => {
    async function fetchRoutines() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Create a more efficient query that includes user profile data
        // Using the Supabase join capability to get profile data in a single query
        let query = supabase
          .from('community_builds')
          .select(`
            *,
            profiles:user_data_personal!owner_user_id(
              display_name,
              avatar_url
            )
          `);

        // If search term exists, filter by routine_name
        if (searchTerm && searchTerm.trim() !== '') {
          query = query.ilike('routine_name', `%${searchTerm}%`);
        } else {
          // If no search term, order by the length of likes_id array (descending)
          query = query.order('likes_id', { ascending: false });
        }

        // Add a limit to prevent loading too many routines
        query = query.limit(20);

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw supabaseError;
        }

        // Process the data to ensure we have all needed info
        const processedRoutines = data?.map(routine => ({
          ...routine,
          display_name: routine.profiles?.display_name || routine.display_name || 'Anonymous',
          avatar_url: routine.profiles?.avatar_url || routine.avatar_url
        })) || [];
        console.log('processedRoutines', processedRoutines)
        setRoutines(processedRoutines);
      } catch (err) {
        console.error('Error fetching routines:', err);
        setError('Failed to load routines. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoutines();
  }, [searchTerm]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center animate-fade-in">Community Builds</h1>

          {/* Search bar */}
          <BuildsSearchBar initialValue={searchTerm} />

          {/* Display results */}
          <div>
            {searchTerm ? (
              <p className="mb-4 text-sm text-gray-600">
                Showing results for "{searchTerm}": {routines.length} routine(s) found
              </p>
            ) : (
              <p className="mb-4 text-sm text-gray-600">
                Showing most popular routines
              </p>
            )}

            {isLoading ? (
              <div className="p-8 text-center">Loading routines...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {routines.length > 0 ? (
                  routines.map((routine) => (
                    <Link href={`/builds/${routine.shareable_id}`} key={routine.shareable_id}>
                      <Card
                        className="animate-fade-in hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer"
                      >
                        <CardContent className="p-6 flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar>
                              <AvatarImage src={routine.avatar_url} />
                              <AvatarFallback>{routine.display_name?.charAt(0) || routine.user_id?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{routine.display_name || 'Unknown User'}</h3>
                              <p className="text-sm text-gray-500">{routine.routine_name}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-600">Skin Type:</p>
                              <div className="flex flex-wrap gap-2">
                                {routine.skin_type.map((type, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-white rounded-lg h-[110px] flex flex-col">
                              <h4 className="text-sm font-semibold text-indigo-600 mb-2">Morning Routine</h4>
                              <div className="relative flex-1">
                                {routine.day_products?.length > 0 ? (
                                  <ul className={`space-y-2 ${routine.day_products.length > 3 ? 'max-h-[88px] overflow-hidden' : ''}`}>
                                    {routine.day_products.map((product, index) => (
                                      <li key={product.id} className="text-sm flex items-center gap-2">
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                                        {product.name}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No morning products selected</p>
                                )}
                                {routine.day_products?.length > 3 && (
                                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                                )}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg h-[110px] flex flex-col">
                              <h4 className="text-sm font-semibold text-indigo-600 mb-2">Evening Routine</h4>
                              <div className="relative flex-1">
                                {routine.night_products?.length > 0 ? (
                                  <ul className={`space-y-2 ${routine.night_products.length > 3 ? 'max-h-[88px] overflow-hidden' : ''}`}>
                                    {routine.night_products.map((product, index) => (
                                      <li key={product.id} className="text-sm flex items-center gap-2">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                                        {product.name}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No evening products selected</p>
                                )}
                                {routine.night_products?.length > 3 && (
                                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                                )}
                              </div>
                            </div>
                          </div>

                          <h4 className="text-sm font-semibold text-indigo-600 mt-6 mb-2">About this Routine</h4>
                          <p className="text-sm text-gray-600">
                            {routine.routine_description || "No description provided"}
                          </p>

                          <div className="flex items-center gap-2 mt-4">
                            {Object.values(routine.comments).flat()[0] && (
                              <p className="text-sm text-gray-500 italic">
                                "{Object.values(routine.comments).flat()[0]?.toString()}"
                              </p>
                            )}
                          </div>

                          {/* Temporary - always show the button for testing */}
                          <div className="flex items-center gap-2">
                            <DeleteRoutineButton
                              shareableId={routine.shareable_id}
                            />
                            <span className="text-xs text-gray-500">
                              user: {user?.id?.substring(0, 8)}, owner: {routine.owner_user_id?.substring(0, 8)}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 px-6 py-4 mt-auto">
                          <div className="flex items-center justify-between w-full text-gray-500">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`hover:text-red-500 transition-colors`}
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              {routine.likes_id?.length || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:text-blue-500 transition-colors max-w-full">
                              <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">
                                {Object.values(routine.comments).flat().length} comments
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:text-green-500 transition-colors"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    {searchTerm ? (
                      <p>No routines found matching "{searchTerm}". Try a different search term.</p>
                    ) : (
                      <p>No routines available.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}