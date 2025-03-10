'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { createClient } from '@/utils/supabase/client';
import { Input } from "@/app/components/ui/input";
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
  const [selectedFilters, setSelectedFilters] = useState<{
    skinTypes: string[];
    climateTypes: string[];
    skinConcerns: string[];
  }>({
    skinTypes: [],
    climateTypes: [],
    skinConcerns: [],
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking authentication:', error);
          return;
        }
        
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('Error checking authentication:', err);
      }
    }
    
    checkAuth();
  }, []);

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[filterType as keyof typeof prev];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [filterType]: newValues,
      };
    });
  };

  const [routines, setRoutines] = useState<SkinRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredRoutines, setFilteredRoutines] = useState<SkinRoutine[]>([]);

  useEffect(() => {
    async function fetchRoutines() {
      try {
        const supabase = createClient();
        const { data, error: supabaseError } = await supabase
          .from('community_builds')
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        // Fetch user data for each routine
        //routine is a single row from the community_builds table
        const routinesWithUserData = await Promise.all(
          data.map(async (routine) => {
            // Get user data from user_data_personal table
            const { data: userData, error: userError } = await supabase
              .from('user_data_personal')
              .select('display_name, avatar_url')
              .eq('id', routine.owner_user_id)
              .single();

            if (userError) {
              console.error('Error fetching user data for display routine:', userError);
              return {
                ...routine,
                display_name: 'Unknown User',
                avatar_url: null
              };
            }

            return {
              ...routine,
              display_name: userData?.display_name || 'Unknown User',
              avatar_url: userData?.avatar_url || null
            };
          })
        );

        setRoutines(routinesWithUserData);
        setFilteredRoutines(routinesWithUserData);
        console.log('routinesWithUserData', routinesWithUserData)
      } catch (err) {
        console.error('Error fetching routines:', err);
        setError('Failed to load routines');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoutines();
  }, []);

  useEffect(() => {
    const filtered = routines.filter((routine) => {
      const matchesSkinType = selectedFilters.skinTypes.length === 0 ||
        routine.skin_type.some((type) => selectedFilters.skinTypes.includes(type.toLowerCase()));

      return matchesSkinType;
    });

    setFilteredRoutines(filtered);
  }, [selectedFilters, routines]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8 text-center">
            Loading routines...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8 text-center text-red-600">
            {error}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center animate-fade-in">Community Builds</h1>

          {/* Add filter section */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {/* Skin Type Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  Skin Type
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search skin types..." />
                  <CommandEmpty>No skin type found.</CommandEmpty>
                  <CommandGroup>
                    {skinTypes.map((type) => (
                      <CommandItem
                        key={type.value}
                        onSelect={() => {
                          handleFilterChange('skinTypes', type.value);
                        }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedFilters.skinTypes.includes(type.value)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-slate-100 active:bg-slate-200"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedFilters.skinTypes.includes(type.value)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {type.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Climate Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  Climate
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search climates..." />
                  <CommandEmpty>No climate found.</CommandEmpty>
                  <CommandGroup>
                    {climateTypes.map((type) => (
                      <CommandItem
                        key={type.value}
                        onSelect={() => {
                          handleFilterChange('climateTypes', type.value);
                        }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedFilters.climateTypes.includes(type.value)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-slate-100 active:bg-slate-200"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedFilters.climateTypes.includes(type.value)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {type.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Skin Concerns Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  Skin Concerns
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search concerns..." />
                  <CommandEmpty>No concern found.</CommandEmpty>
                  <CommandGroup>
                    {skinConcerns.map((type) => (
                      <CommandItem
                        key={type.value}
                        onSelect={() => {
                          handleFilterChange('skinConcerns', type.value);
                        }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedFilters.skinConcerns.includes(type.value)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-slate-100 active:bg-slate-200"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedFilters.skinConcerns.includes(type.value)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {type.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Display selected filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.entries(selectedFilters).map(([filterType, values]) =>
              values.map((value) => (
                <span
                  key={`${filterType}-${value}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {value}
                  <button
                    onClick={() => handleFilterChange(filterType, value)}
                    className="ml-1 hover:text-blue-600"
                  >
                    
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutines.map((routine) => (
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
                  </CardContent>
                  <CardFooter className="bg-gray-50 px-6 py-4 mt-auto">
                    <div className="flex items-center justify-between w-full text-gray-500">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`hover:text-red-500 transition-colors ${!isAuthenticated && 'opacity-50 cursor-not-allowed'}`}
                        disabled={!isAuthenticated}
                        title={!isAuthenticated ? "Sign in to like" : ""}
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
            ))}
          </div>
          
          {!isAuthenticated && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-2">Sign in to like and comment on routines</p>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}