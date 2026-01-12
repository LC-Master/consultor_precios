import { format } from "date-fns";
import { useState, useEffect } from "react";

export default function Clock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <div className="flex flex-col items-end">
                <div className="flex items-baseline">
                    <span className="font-light text-4xl leading-none">{format(now, 'HH:mm')}</span>
                    <span className="text-xs py-0.5 rounded text-locatel-medio  -translate-y-0.5">
                        {now.getHours() >= 12 ? 'PM' : 'AM'}
                    </span>
                </div>
                <div className="text-xs tracking-wide text-gray-400 uppercase mt-1">
                    {now.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase()}, {now.getDate()} {now.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()}
                </div>
            </div>
        </>
    );
}
