import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  MagnifyingGlass, 
  Funnel, 
  X,
  SortAscending,
  Star
} from '@phosphor-icons/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import type { Service, ServiceCategory } from '@/lib/types'

interface SearchFiltersProps {
  services: Service[]
  onFilteredResults: (filtered: Service[]) => void
}

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'sales' | 'name'

const CATEGORIES: ServiceCategory[] = [
  'Data Analysis',
  'Content Generation',
  'API Access',
  'Compute Resources',
  'Machine Learning',
  'Image Processing',
]

export default function SearchFilters({ services, onFilteredResults }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<ServiceCategory>>(new Set())
  const [priceRange, setPriceRange] = useState([0, 500])
  const [minRating, setMinRating] = useState(0)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('relevance')

  const maxPrice = useMemo(() => {
    return Math.max(...services.map(s => s.price), 500)
  }, [services])

  const filteredAndSorted = useMemo(() => {
    let filtered = services.filter(service => {
      const matchesSearch = searchQuery === '' ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.provider.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategories.size === 0 ||
        selectedCategories.has(service.category)

      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1]

      const matchesRating = service.rating >= minRating

      const matchesAvailability = !availableOnly || service.available

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesAvailability
    })

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'sales':
        filtered.sort((a, b) => b.sales - a.sales)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    return filtered
  }, [services, searchQuery, selectedCategories, priceRange, minRating, availableOnly, sortBy])

  useMemo(() => {
    onFilteredResults(filteredAndSorted)
  }, [filteredAndSorted, onFilteredResults])

  const toggleCategory = (category: ServiceCategory) => {
    const newCategories = new Set(selectedCategories)
    if (newCategories.has(category)) {
      newCategories.delete(category)
    } else {
      newCategories.add(category)
    }
    setSelectedCategories(newCategories)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories(new Set())
    setPriceRange([0, maxPrice])
    setMinRating(0)
    setAvailableOnly(false)
    setSortBy('relevance')
  }

  const hasActiveFilters = 
    searchQuery !== '' ||
    selectedCategories.size > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== maxPrice ||
    minRating > 0 ||
    availableOnly ||
    sortBy !== 'relevance'

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services, providers, descriptions..."
            className="pl-10 pr-4"
          />
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Funnel className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="default" className="ml-1 px-1.5 py-0 text-xs">
                    {[
                      searchQuery !== '',
                      selectedCategories.size > 0,
                      priceRange[0] !== 0 || priceRange[1] !== maxPrice,
                      minRating > 0,
                      availableOnly,
                      sortBy !== 'relevance',
                    ].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(category => (
                      <Badge
                        key={category}
                        variant={selectedCategories.has(category) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">
                    Price Range: {priceRange[0]} - {priceRange[1]} MNEE
                  </h4>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={maxPrice}
                    step={5}
                    className="mb-2"
                  />
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">
                    Minimum Rating: {minRating > 0 ? `${minRating}+` : 'Any'}
                  </h4>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map(rating => (
                      <Button
                        key={rating}
                        variant={minRating === rating ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMinRating(rating)}
                        className="gap-1"
                      >
                        {rating === 0 ? 'Any' : (
                          <>
                            <Star className="w-3 h-3" weight="fill" />
                            {rating}+
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Available Only</label>
                  <Switch
                    checked={availableOnly}
                    onCheckedChange={setAvailableOnly}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SortAscending className="w-4 h-4" />
                Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="space-y-1">
                {[
                  { value: 'relevance' as const, label: 'Relevance' },
                  { value: 'price-low' as const, label: 'Price: Low to High' },
                  { value: 'price-high' as const, label: 'Price: High to Low' },
                  { value: 'rating' as const, label: 'Highest Rated' },
                  { value: 'sales' as const, label: 'Most Popular' },
                  { value: 'name' as const, label: 'Name (A-Z)' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      sortBy === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredAndSorted.length} results
          </span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {Array.from(selectedCategories).map(category => (
            <Badge key={category} variant="secondary" className="gap-1">
              {category}
              <button onClick={() => toggleCategory(category)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {(priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              {priceRange[0]}-{priceRange[1]} MNEE
              <button onClick={() => setPriceRange([0, maxPrice])}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {minRating}+ stars
              <button onClick={() => setMinRating(0)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
