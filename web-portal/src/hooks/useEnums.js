import { useState, useEffect } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

// Cache for enum data to avoid repeated fetches
let enumCache = null
let cachePromise = null

/**
 * useEnums - Custom hook for fetching and caching enum/dropdown data
 * 
 * Usage:
 *   const { enums, loading, error } = useEnums()
 *   // Access: enums.species, enums.units, enums.testTypes, etc.
 */
export const useEnums = () => {
  const [enums, setEnums] = useState(enumCache)
  const [loading, setLoading] = useState(!enumCache)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEnums = async () => {
      // Return cached data if available
      if (enumCache) {
        setEnums(enumCache)
        setLoading(false)
        return
      }

      // If already fetching, wait for that promise
      if (cachePromise) {
        try {
          const data = await cachePromise
          setEnums(data)
          setLoading(false)
        } catch (err) {
          setError(err.message)
          setLoading(false)
        }
        return
      }

      // Start new fetch
      setLoading(true)
      cachePromise = fetch(`${BACKEND_URL}/api/v1/enums`)
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            enumCache = result.data
            return result.data
          }
          throw new Error(result.message || 'Failed to fetch enums')
        })

      try {
        const data = await cachePromise
        setEnums(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        // Use fallback data
        setEnums(getFallbackEnums())
      } finally {
        setLoading(false)
        cachePromise = null
      }
    }

    fetchEnums()
  }, [])

  return { enums: enums || getFallbackEnums(), loading, error }
}

/**
 * clearEnumCache - Clear cached enum data (useful after admin updates)
 */
export const clearEnumCache = () => {
  enumCache = null
  cachePromise = null
}

/**
 * Fallback enum data if API fails
 */
const getFallbackEnums = () => ({
  species: [
    { value: 'Ashwagandha', label: 'Ashwagandha (Withania somnifera)' },
    { value: 'Turmeric', label: 'Turmeric (Curcuma longa)' },
    { value: 'Brahmi', label: 'Brahmi (Bacopa monnieri)' },
    { value: 'Tulsi', label: 'Tulsi (Ocimum sanctum)' },
    { value: 'Neem', label: 'Neem (Azadirachta indica)' },
    { value: 'Giloy', label: 'Giloy (Tinospora cordifolia)' },
    { value: 'Shatavari', label: 'Shatavari (Asparagus racemosus)' },
    { value: 'Amla', label: 'Amla (Phyllanthus emblica)' }
  ],
  units: [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'lb', label: 'Pounds (lb)' }
  ],
  harvestMethods: [
    { value: 'hand_picking', label: 'Hand Picking' },
    { value: 'cutting', label: 'Cutting' },
    { value: 'digging', label: 'Digging' },
    { value: 'pruning', label: 'Pruning' }
  ],
  plantParts: [
    { value: 'whole_plant', label: 'Whole Plant' },
    { value: 'leaves', label: 'Leaves' },
    { value: 'roots', label: 'Roots' },
    { value: 'flowers', label: 'Flowers' },
    { value: 'seeds', label: 'Seeds' },
    { value: 'bark', label: 'Bark' }
  ],
  weatherConditions: [
    { value: 'sunny', label: 'Sunny' },
    { value: 'cloudy', label: 'Cloudy' },
    { value: 'rainy', label: 'Rainy' },
    { value: 'humid', label: 'Humid' }
  ],
  soilTypes: [
    { value: 'loamy', label: 'Loamy' },
    { value: 'clay', label: 'Clay' },
    { value: 'sandy', label: 'Sandy' }
  ],
  testTypes: [
    { value: 'moisture_content', label: 'Moisture Content', duration: '30 min', threshold: '< 12%' },
    { value: 'pesticide_residue', label: 'Pesticide Residue', duration: '2 hours', threshold: '< 0.1 ppm' },
    { value: 'heavy_metals', label: 'Heavy Metals', duration: '3 hours', threshold: '< 10 ppm' },
    { value: 'dna_authentication', label: 'DNA Authentication', duration: '4 hours', threshold: '> 95% match' }
  ],
  productTypes: [
    { value: 'powder', label: 'Powder' },
    { value: 'extract', label: 'Extract' },
    { value: 'capsule', label: 'Capsule' },
    { value: 'oil', label: 'Oil' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'syrup', label: 'Syrup' }
  ],
  processTypes: [
    { value: 'cleaning', label: 'Cleaning & Sorting' },
    { value: 'drying', label: 'Drying' },
    { value: 'grinding', label: 'Grinding' },
    { value: 'extraction', label: 'Extraction' },
    { value: 'packaging', label: 'Packaging' }
  ],
  complaintCategories: [
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'delivery_delay', label: 'Delivery Delay' },
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'documentation', label: 'Documentation Problem' },
    { value: 'compliance', label: 'Compliance Issue' },
    { value: 'technical', label: 'Technical Problem' },
    { value: 'other', label: 'Other' }
  ],
  roles: [
    { value: 'Farmer', label: 'Farmer' },
    { value: 'Lab', label: 'Laboratory' },
    { value: 'Manufacturer', label: 'Manufacturer' },
    { value: 'Consumer', label: 'Consumer' },
    { value: 'Regulator', label: 'Regulator' }
  ],
  organizations: [
    { value: 'Farmers', label: 'Farmers Cooperative' },
    { value: 'Labs', label: 'Testing Laboratories' },
    { value: 'Manufacturers', label: 'Manufacturers' },
    { value: 'Processors', label: 'Processors' }
  ],
  batchStatuses: [
    { value: 'created', label: 'Created' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_processing', label: 'In Processing' },
    { value: 'quality_tested', label: 'Quality Tested' },
    { value: 'approved', label: 'Approved' }
  ],
  violationTypes: [
    { value: 'out_of_season', label: 'Out-of-Season Harvest' },
    { value: 'protected_area', label: 'Protected Area Violation' },
    { value: 'quota_exceeded', label: 'Quota Exceeded' },
    { value: 'quality_failure', label: 'Quality Test Failure' }
  ]
})

export default useEnums
