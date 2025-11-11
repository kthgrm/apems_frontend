import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/// <reference types="google.maps" />

interface GooglePlacesAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    onPlaceSelected?: (place: any) => void;
}

export default function GooglePlacesAutocomplete({
    id,
    value,
    onChange,
    placeholder = "Enter location",
    disabled = false,
    className,
    onPlaceSelected,
}: GooglePlacesAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if Google Maps API is already loaded
        const google = (window as any).google;
        if (google && google.maps && google.maps.places) {
            setIsLoaded(true);
            return;
        }

        // Get API key from environment variable
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            setError('Google Maps API key is not configured');
            console.error('Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
            return;
        }

        // Load Google Maps API script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            setIsLoaded(true);
        };

        script.onerror = () => {
            setError('Failed to load Google Maps API');
            console.error('Failed to load Google Maps API');
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup script if component unmounts
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (!isLoaded || !inputRef.current || disabled) return;

        // Initialize autocomplete
        const google = (window as any).google;
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['geocode', 'establishment'],
            componentRestrictions: { country: 'ph' }, // Restrict to Philippines, change as needed
        });

        // Add place changed listener
        const listener = autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();

            if (place && place.formatted_address) {
                onChange(place.formatted_address);
                onPlaceSelected?.(place);
            }
        });

        return () => {
            if (listener) {
                const google = (window as any).google;
                google.maps.event.removeListener(listener);
            }
        };
    }, [isLoaded, disabled, onChange, onPlaceSelected]);

    // Handle manual input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    if (error) {
        // Fallback to regular input if Google Maps fails
        return (
            <div>
                <Input
                    id={id}
                    ref={inputRef}
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={className}
                />
                <p className="text-xs text-yellow-600 mt-1">
                    Location autocomplete unavailable - using manual input
                </p>
            </div>
        );
    }

    return (
        <Input
            id={id}
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled || !isLoaded}
            className={cn(className, !isLoaded && "opacity-50")}
        />
    );
}
