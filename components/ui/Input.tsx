export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...props}
        />
    );
}