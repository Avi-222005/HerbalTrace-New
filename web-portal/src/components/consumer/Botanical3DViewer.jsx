import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Leaf, 
  Sparkles, 
  RotateCw, 
  Camera, 
  Eye, 
  Info, 
  BookOpen, 
  CheckCircle2, 
  HeartHandshake, 
  Flame, 
  Wind, 
  Droplets,
  X,
  Layers
} from 'lucide-react'

const Botanical3DViewer = ({ species = 'Tulsi', productName = 'Ayurvedic Botanical Monograph' }) => {
  const mountRef = useRef(null)
  const [selectedHotspot, setSelectedHotspot] = useState(null)
  const [showMonographModal, setShowMonographModal] = useState(false)
  const [isArActive, setIsArActive] = useState(false)
  const [arError, setArError] = useState(null)
  const videoRef = useRef(null)

  // Ayurvedic Data for Species
  const ayurvedicData = {
    'Tulsi': {
      botanicalName: 'Ocimum sanctum (Holy Basil)',
      family: 'Lamiaceae',
      dosha: { vata: 'Pacifies (↓)', pitta: 'Balances (↓)', kapha: 'Reduces (↓↓)' },
      dravyaguna: {
        rasa: 'Katu (Pungent), Tikta (Bitter)',
        guna: 'Laghu (Light), Ruksha (Dry)',
        virya: 'Ushna (Warm Potency)',
        vipaka: 'Katu (Pungent Post-Digestive)'
      },
      activePhyto: 'Eugenol (71.3%), Caryophyllene, Ursolic Acid',
      clinicalUsage: {
        dosage: '1–2 capsules or 500mg extract twice daily after meals.',
        anupana: 'Warm water with organic honey or raw ginger juice.',
        benefits: 'Immunomodulator, adaptogenic stress reliever, respiratory decongestant.',
        contraindications: 'Avoid high dosage during early pregnancy without physician guidance.'
      },
      parts: {
        leaf: { name: 'Leaf (Patra)', role: 'Rich in aromatic Eugenol & immunomodulatory flavonoids.' },
        stem: { name: 'Stem (Kanda)', role: 'Used for antimicrobial decoctions and adaptogenic tea.' },
        flower: { name: 'Inflorescence (Manjari)', role: 'Concentrated essential oil with antioxidant properties.' }
      }
    },
    'Ashwagandha': {
      botanicalName: 'Withania somnifera (Indian Ginseng)',
      family: 'Solanaceae',
      dosha: { vata: 'Calms (↓↓)', pitta: 'Neutral (↔)', kapha: 'Balances (↓)' },
      dravyaguna: {
        rasa: 'Tikta (Bitter), Kashaya (Astringent), Madhura (Sweet)',
        guna: 'Guru (Heavy), Snigdha (Unctuous)',
        virya: 'Ushna (Warm)',
        vipaka: 'Madhura (Sweet)'
      },
      activePhyto: 'Withanolides (Withaferin A, Withanolide D > 2.5%)',
      clinicalUsage: {
        dosage: '300–500mg standardized extract once daily before sleep.',
        anupana: 'Warm cow milk with a pinch of nutmeg or ghee.',
        benefits: 'Rasayana (Rejuvenator), cortisol reduction, cognitive & physical vitality.',
        contraindications: 'Monitor blood sugar in diabetic patients due to metabolic modulation.'
      },
      parts: {
        leaf: { name: 'Leaf', role: 'External soothing poultices and metabolic regulation.' },
        stem: { name: 'Aerial Stem', role: 'Structural bioflavonoids and antioxidant reserves.' },
        flower: { name: 'Root & Tuber', role: 'Primary Ayurvedic source for standardized Withanolides.' }
      }
    }
  }

  const currentAyurveda = ayurvedicData[species] || ayurvedicData['Tulsi']

  // Three.js 3D Procedural Botanical Model
  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight || 340

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 1.5, 4.5)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0x10b981, 1.8)
    sunLight.position.set(5, 8, 5)
    sunLight.castShadow = true
    scene.add(sunLight)

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.2)
    fillLight.position.set(-5, -2, -3)
    scene.add(fillLight)

    // Plant Group
    const plantGroup = new THREE.Group()
    scene.add(plantGroup)

    // 1. Ceramic Botanical Pot
    const potGeo = new THREE.CylinderGeometry(0.7, 0.5, 0.9, 32)
    const potMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.3,
      metalness: 0.2
    })
    const pot = new THREE.Mesh(potGeo, potMat)
    pot.position.y = -0.7
    plantGroup.add(pot)

    // Soil
    const soilGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.1, 32)
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 })
    const soil = new THREE.Mesh(soilGeo, soilMat)
    soil.position.y = -0.26
    plantGroup.add(soil)

    // 2. Main Stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.2, 0),
      new THREE.Vector3(0.05, 0.6, 0.05),
      new THREE.Vector3(-0.05, 1.2, -0.02),
      new THREE.Vector3(0, 1.7, 0)
    ])
    const stemGeo = new THREE.TubeGeometry(stemCurve, 20, 0.045, 8, false)
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 })
    const stem = new THREE.Mesh(stemGeo, stemMat)
    plantGroup.add(stem)

    // 3. Procedural Botanical Leaves
    const leafGeo = new THREE.SphereGeometry(0.28, 16, 16)
    leafGeo.scale(1, 0.2, 2.2)

    const leafMat = new THREE.MeshStandardMaterial({ 
      color: species === 'Tulsi' ? 0x15803d : 0x16a34a,
      roughness: 0.25,
      metalness: 0.1,
      bumpScale: 0.05
    })

    const leafPositions = [
      { pos: [0.35, 0.5, 0.2], rot: [0.3, 0.8, -0.4] },
      { pos: [-0.35, 0.7, -0.2], rot: [-0.3, -0.8, 0.4] },
      { pos: [0.3, 1.0, -0.3], rot: [-0.2, 1.2, -0.3] },
      { pos: [-0.3, 1.2, 0.3], rot: [0.2, -1.2, 0.3] },
      { pos: [0.25, 1.4, 0.1], rot: [0.1, 0.5, -0.2] },
      { pos: [-0.25, 1.5, -0.1], rot: [-0.1, -0.5, 0.2] }
    ]

    leafPositions.forEach(({ pos, rot }) => {
      const leaf = new THREE.Mesh(leafGeo, leafMat)
      leaf.position.set(...pos)
      leaf.rotation.set(...rot)
      plantGroup.add(leaf)
    })

    // 4. Inflorescence / Botanical Flowers
    const flowerGeo = new THREE.ConeGeometry(0.12, 0.45, 12)
    const flowerMat = new THREE.MeshStandardMaterial({ 
      color: species === 'Tulsi' ? 0x8b5cf6 : 0xfbbf24, 
      roughness: 0.4 
    })
    const flower = new THREE.Mesh(flowerGeo, flowerMat)
    flower.position.set(0, 1.85, 0)
    plantGroup.add(flower)

    // Interactive Drag / Rotation
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e) => {
      isDragging = true
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX)
      prevMouseY = e.clientY || (e.touches && e.touches[0].clientY)
    }

    const onMouseMove = (e) => {
      if (!isDragging) return
      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)
      const deltaX = clientX - prevMouseX
      const deltaY = clientY - prevMouseY

      plantGroup.rotation.y += deltaX * 0.008
      plantGroup.rotation.x = Math.max(-0.4, Math.min(0.4, plantGroup.rotation.x + deltaY * 0.008))

      prevMouseX = clientX
      prevMouseY = clientY
    }

    const onMouseUp = () => {
      isDragging = false
    }

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('touchstart', onMouseDown)
    window.addEventListener('touchmove', onMouseMove)
    window.addEventListener('touchend', onMouseUp)

    // Animation Loop (Gentle Wind Sway)
    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      if (!isDragging) {
        plantGroup.rotation.y += 0.004
        stem.rotation.z = Math.sin(elapsedTime * 1.5) * 0.02
        flower.rotation.x = Math.cos(elapsedTime * 2) * 0.03
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('touchstart', onMouseDown)
      window.removeEventListener('touchmove', onMouseMove)
      window.removeEventListener('touchend', onMouseUp)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [species])

  // Start Augmented Reality Camera Stream
  const toggleArMode = async () => {
    if (isArActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
      setIsArActive(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setIsArActive(true)
      setArError(null)
    } catch (err) {
      setArError('Camera access denied or unavailable for AR projection.')
    }
  }

  return (
    <div className="space-y-4">
      {/* 3D Canvas Box */}
      <div className="relative rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl overflow-hidden">
        {/* AR Camera Video Background */}
        {isArActive && (
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
          />
        )}

        {/* 3D Container Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
              <h3 className="text-sm font-extrabold text-white">Interactive 3D Botanical Specimen & AR Monograph</h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{currentAyurveda.botanicalName}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleArMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
                isArActive 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{isArActive ? 'Exit AR Mode' : 'View in Room (AR)'}</span>
            </button>
            <button
              onClick={() => setShowMonographModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Usage & Dosha Guide</span>
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <div ref={mountRef} className="relative z-10 w-full h-72 cursor-grab active:cursor-grabbing" />

        {/* Botanical Hotspots Bar */}
        <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Drag to rotate • Pinch to zoom</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {Object.entries(currentAyurveda.parts).map(([key, part]) => (
              <button
                key={key}
                onClick={() => setSelectedHotspot(part)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-[11px] font-bold font-mono transition-colors"
              >
                ● {part.name}
              </button>
            ))}
          </div>
        </div>

        {/* Hotspot Info Popup */}
        <AnimatePresence>
          {selectedHotspot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative z-20 mt-3 p-3.5 bg-emerald-950/90 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center justify-between shadow-xl"
            >
              <div>
                <strong className="text-white block font-mono">{selectedHotspot.name}</strong>
                <span>{selectedHotspot.role}</span>
              </div>
              <button onClick={() => setSelectedHotspot(null)} className="p-1 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ayurvedic Tridosha & Usage Guide Modal */}
      <AnimatePresence>
        {showMonographModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6 text-slate-100"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Ayurvedic Monograph & Clinical Usage Guide</h3>
                    <p className="text-xs text-slate-400 font-mono">{currentAyurveda.botanicalName} • Ayush Pharmacopoeia</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMonographModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tridosha Balancing Matrix */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tridosha Balancing Profile</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-cyan-500/30">
                    <Wind className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-mono">VATA DOSHA</span>
                    <span className="font-bold text-xs text-cyan-300">{currentAyurveda.dosha.vata}</span>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-amber-500/30">
                    <Flame className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-mono">PITTA DOSHA</span>
                    <span className="font-bold text-xs text-amber-300">{currentAyurveda.dosha.pitta}</span>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-emerald-500/30">
                    <Droplets className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-mono">KAPHA DOSHA</span>
                    <span className="font-bold text-xs text-emerald-300">{currentAyurveda.dosha.kapha}</span>
                  </div>
                </div>
              </div>

              {/* Dravyaguna Pharmacology Matrix */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <h4 className="text-xs font-bold text-emerald-400">Ayurvedic Dravyaguna Pharmacology</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Rasa (Taste)</span>
                    <span className="font-semibold">{currentAyurveda.dravyaguna.rasa}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Guna (Qualities)</span>
                    <span className="font-semibold">{currentAyurveda.dravyaguna.guna}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Virya (Potency)</span>
                    <span className="font-semibold">{currentAyurveda.dravyaguna.virya}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Vipaka (Post-Digestive)</span>
                    <span className="font-semibold">{currentAyurveda.dravyaguna.vipaka}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Dosage & Anupana (Carriers) */}
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-emerald-400 font-bold block">Recommended Dosage:</span>
                  <p className="text-slate-300">{currentAyurveda.clinicalUsage.dosage}</p>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-teal-400 font-bold block">Optimal Anupana (Vehicle / Carrier):</span>
                  <p className="text-slate-300">{currentAyurveda.clinicalUsage.anupana}</p>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-amber-400 font-bold block">Ayush Health Benefits:</span>
                  <p className="text-slate-300">{currentAyurveda.clinicalUsage.benefits}</p>
                </div>

                <div className="p-4 bg-rose-950/30 rounded-2xl border border-rose-800/40 text-rose-300 space-y-1">
                  <span className="font-bold block">Advisory & Contraindications:</span>
                  <p className="text-xs text-rose-200">{currentAyurveda.clinicalUsage.contraindications}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowMonographModal(false)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Close Monograph
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Botanical3DViewer
