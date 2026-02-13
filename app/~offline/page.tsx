'use client';
export default function OfflinePage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#000',
            color: '#fff'
        }}>
            <h1>Sincronización interrumpida</h1>
            <p>Parece que no tienes conexión a internet en la tienda.</p>
            <div style={{
                marginTop: '20px',
                padding: '15px',
                border: '1px solid #333',
                borderRadius: '8px'
            }}>
                <p>El consultor de precios necesita conexión para obtener datos reales.</p>
            </div>
            <button
                onClick={() => {
                    if (typeof globalThis !== 'undefined') {
                        (globalThis as any).location.reload();
                    }
                }}
                style={{
                    marginTop: '30px',
                    padding: '10px 20px',
                    backgroundColor: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Reintentar conexión
            </button>
        </div>
    );
}