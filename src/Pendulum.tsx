import React, {
    useRef,
    PropsWithChildren,
    useEffect,
    useCallback,
} from "react";

interface TSize {
    width: number;
    height: number;
}

const g = 9.8;
const c = 0.5;
const m = 10;

const Pendulum: React.FC<
    PropsWithChildren<
        {
            size?: TSize;
            length?: number;
            isOnPause?: boolean;
            acceleration?: number;
        } & React.HTMLAttributes<HTMLCanvasElement>
    >
> = ({ size, length, isOnPause, className, acceleration }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const requestIdRef = useRef<number | null>(null);
    const prevTimestampRef = useRef<number | null>(null);
    const anglesRef = useRef({
        t: -Math.PI + 2 * Math.PI * Math.random(),
        v: -2 * Math.PI + 4 * Math.PI * Math.random(),
    });

    const onPause = isOnPause ?? false;

    const { width, height } = size ?? { width: 500, height: 500 };
    const mid = { width: width / 2, height: height / 2 };

    const pixelLength = length ?? 250;
    const meterLength = pixelLength / 100;

    const a = acceleration ?? 0;

    const updateModel = useCallback(
        (delta: number) => {
            if (onPause) return;

            delta = delta * 0.001;

            const pdelta = delta / 1000;
            for (let i = 0; i < 1000; ++i) {
                const { t, v } = anglesRef.current;

                const nextV =
                    v +
                    pdelta *
                        (a -
                            (g * Math.sin(t)) / meterLength -
                            (c / m) * meterLength * v);

                anglesRef.current = {
                    t: t + pdelta * nextV,
                    v: nextV,
                };
            }
        },
        [onPause, meterLength, a]
    );

    const renderFrame = useCallback(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.lineCap = "round";

        ctx.moveTo(mid.width, mid.height);

        const endx = mid.width + Math.sin(anglesRef.current.t) * pixelLength;
        const endy = mid.height + Math.cos(anglesRef.current.t) * pixelLength;

        ctx.lineTo(endx, endy);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mid.width, mid.height, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = "green";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(endx, endy, 25, 0, 2 * Math.PI, false);
        ctx.fillStyle = "red";
        ctx.fill();
    }, [mid, pixelLength]);

    const tick = useCallback(
        (timestamp: number) => {
            if (!canvasRef.current) return;
            if (!prevTimestampRef.current) {
                requestIdRef.current = requestAnimationFrame((timestamp) => {
                    prevTimestampRef.current = timestamp;
                    requestIdRef.current = requestAnimationFrame(tick);
                });

                return;
            }

            const delta = timestamp - prevTimestampRef.current;

            updateModel(delta);
            renderFrame();

            requestIdRef.current = requestAnimationFrame(tick);
            prevTimestampRef.current = timestamp;
        },
        [updateModel, renderFrame]
    );

    useEffect(() => {
        requestIdRef.current = requestAnimationFrame(tick);

        return () => {
            if (!requestIdRef.current) return;
            cancelAnimationFrame(requestIdRef.current);
        };
    }, [tick]);

    return (
        <canvas
            width={width}
            height={height}
            className={className}
            ref={canvasRef}
        />
    );
};

export default Pendulum;
