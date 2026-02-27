import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import './DentalChart.css';
import { sileo } from 'sileo';
import { Save, Trash2, Printer, RotateCcw } from 'lucide-react';

interface ToothData {
    oclusal: string;
    mesial: string;
    distal: string;
    vestibular: string;
    lingual: string;
}

interface OdontogramData {
    teeth: Record<string, Partial<ToothData>>;
    notes: string;
}

interface DentalChartProps {
    initialData?: OdontogramData;
    onSave: (data: OdontogramData) => Promise<void>;
    patientId: string;
}

const CONDITIONS = [
    { id: 'sano', label: 'Sano', color: '#ffffff' },
    { id: 'caries', label: 'Caries', color: '#ef4444' },
    { id: 'obturado', label: 'Obturado', color: '#3b82f6' },
    { id: 'corona', label: 'Corona', color: '#facc15' },
    { id: 'extraccion_indicada', label: 'Extracción indicada', color: '#f97316' },
    { id: 'extraido', label: 'Extraído', color: '#94a3b8' },
    { id: 'implante', label: 'Implante', color: '#10b981' },
    { id: 'fractura', label: 'Fractura', color: '#a855f7' },
    { id: 'conducto', label: 'Conducto', color: '#ec4899' },
];

export default function DentalChart({ initialData, onSave, patientId }: DentalChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const [selectedCondition, setSelectedCondition] = useState(CONDITIONS[1]); // Default to Caries
    const [teethState, setTeethState] = useState<Record<string, Partial<ToothData>>>(initialData?.teeth || {});
    const [notes, setNotes] = useState(initialData?.notes || "");

    const TOOTH_SIZE = 60;
    const TOOTH_SPACING = 15;
    const ROW_SPACING = 80;

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: (TOOTH_SIZE + TOOTH_SPACING) * 16 + 40,
            height: (TOOTH_SIZE * 2) + ROW_SPACING + 60,
            selection: false,
        });
        fabricRef.current = canvas;

        renderOdontogram(canvas);

        return () => {
            canvas.dispose();
        };
    }, []);

    const renderOdontogram = (canvas: fabric.Canvas) => {
        canvas.clear();
        canvas.setBackgroundColor('#f8fafc', canvas.renderAll.bind(canvas));

        // Upper Teeth (1-16)
        for (let i = 1; i <= 16; i++) {
            drawTooth(canvas, i, 20 + (i - 1) * (TOOTH_SIZE + TOOTH_SPACING), 30);
        }

        // Lower Teeth (17-32) - Note: In some nomenclatures 17 is under 16, but we'll follow 1-16 top, 17-32 bottom linear for now
        for (let i = 17; i <= 32; i++) {
            drawTooth(canvas, i, 20 + (i - 17) * (TOOTH_SIZE + TOOTH_SPACING), 30 + TOOTH_SIZE + ROW_SPACING);
        }

        canvas.renderAll();
    };

    const drawTooth = (canvas: fabric.Canvas, toothId: number, x: number, y: number) => {
        const state = teethState[toothId.toString()] || {};
        const size = TOOTH_SIZE;
        const padding = size * 0.25;

        // Label
        const text = new fabric.Text(toothId.toString(), {
            left: x + size / 2,
            top: y - 25,
            fontSize: 14,
            fontWeight: 'bold',
            originX: 'center',
            fill: '#64748b',
            selectable: false
        });
        canvas.add(text);

        // Individual Surfaces
        const surfaces: (keyof ToothData)[] = ['oclusal', 'mesial', 'distal', 'vestibular', 'lingual'];

        // Vestibular (Top)
        createSurface(canvas, toothId, 'vestibular', [
            { x: 0, y: 0 }, { x: size, y: 0 }, { x: size - padding, y: padding }, { x: padding, y: padding }
        ], x, y);

        // Lingual (Bottom)
        createSurface(canvas, toothId, 'lingual', [
            { x: padding, y: size - padding }, { x: size - padding, y: size - padding }, { x: size, y: size }, { x: 0, y: size }
        ], x, y);

        // Mesial (Left) - Simplified logic: 1-8 mesial is right, 9-16 mesial is left. 
        // For now let's just use consistent names.
        createSurface(canvas, toothId, 'mesial', [
            { x: 0, y: 0 }, { x: padding, y: padding }, { x: padding, y: size - padding }, { x: 0, y: size }
        ], x, y);

        // Distal (Right)
        createSurface(canvas, toothId, 'distal', [
            { x: size - padding, y: padding }, { x: size, y: 0 }, { x: size, y: size }, { x: size - padding, y: size - padding }
        ], x, y);

        // Oclusal (Center)
        createSurface(canvas, toothId, 'oclusal', [
            { x: padding, y: padding }, { x: size - padding, y: padding }, { x: size - padding, y: size - padding }, { x: padding, y: size - padding }
        ], x, y);
    };

    const createSurface = (canvas: fabric.Canvas, toothId: number, surface: keyof ToothData, points: any[], offsetX: number, offsetY: number) => {
        const conditionId = teethState[toothId.toString()]?.[surface] || 'sano';
        const condition = CONDITIONS.find(c => c.id === conditionId) || CONDITIONS[0];

        const polygon = new fabric.Polygon(points, {
            left: offsetX + points[0].x,
            top: offsetY + points[0].y,
            fill: condition.color,
            stroke: '#cbd5e1',
            strokeWidth: 1,
            selectable: false,
            hoverCursor: 'pointer',
        });

        // Fabric.js v6+ doesn't use left/top for points relative to container automatically like v5 in some cases
        // Re-adjusting for coordinates
        polygon.set({ left: offsetX + Math.min(...points.map(p => p.x)), top: offsetY + Math.min(...points.map(p => p.y)) });

        polygon.on('mousedown', () => {
            const newState = {
                ...teethState,
                [toothId]: {
                    ...(teethState[toothId] || { oclusal: 'sano', mesial: 'sano', distal: 'sano', vestibular: 'sano', lingual: 'sano' }),
                    [surface]: selectedCondition.id
                }
            };
            setTeethState(newState);
            polygon.set('fill', selectedCondition.color);
            canvas.renderAll();
        });

        canvas.add(polygon);
    };

    const handleSave = async () => {
        const data = {
            teeth: teethState,
            notes,
        };
        await sileo.promise(onSave(data), {
            loading: "Guardando odontograma...",
            success: "Odontograma guardado correctamente",
            error: "Error al guardar el odontograma"
        });
    };

    const handleReset = () => {
        if (confirm("¿Estás seguro de que quieres limpiar todo el odontograma?")) {
            setTeethState({});
            renderOdontogram(fabricRef.current!);
        }
    };

    return (
        <div className="odontogram-wrapper animate-fade-in">
            <div className="odontogram-controls">
                {CONDITIONS.map(c => (
                    <button
                        key={c.id}
                        className={`condition-btn ${selectedCondition.id === c.id ? 'active' : ''}`}
                        onClick={() => setSelectedCondition(c)}
                    >
                        <span className={`color-dot dot-${c.id}`}></span>
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="odontogram-canvas-container">
                <canvas ref={canvasRef} />
            </div>

            <div className="w-full max-w-[800px]">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Notas del Dentista</label>
                <textarea
                    className="public-input w-full min-h-[100px]"
                    placeholder="Escribe observaciones adicionales aquí..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
            </div>

            <div className="odontogram-actions">
                <button className="btn btn-secondary flex items-center justify-center gap-2" onClick={handleReset}>
                    <RotateCcw size={18} /> Limpiar
                </button>
                <button className="btn btn-primary flex items-center justify-center gap-2" onClick={handleSave}>
                    <Save size={18} /> Guardar Odontograma
                </button>
                <button className="btn bg-slate-100 text-slate-700 flex items-center justify-center gap-2" onClick={() => window.print()}>
                    <Printer size={18} /> Imprimir
                </button>
            </div>
        </div>
    );
}
