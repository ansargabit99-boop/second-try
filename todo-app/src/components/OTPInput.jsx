import { useRef, useEffect, useState } from 'react';

const OTPInput = ({ length = 6, onComplete }) => {
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Take only the last character if pasted multiple
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Call onComplete when all filled
        const otpString = newOtp.join('');
        if (otpString.length === length) {
            onComplete(otpString);
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);

        if (isNaN(pastedData)) return;

        const newOtp = pastedData.split('');
        setOtp([...newOtp, ...new Array(length - newOtp.length).fill('')]);

        // Focus last filled input or last input
        const focusIndex = Math.min(newOtp.length, length - 1);
        inputRefs.current[focusIndex].focus();

        // Call onComplete if full
        if (pastedData.length === length) {
            onComplete(pastedData);
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold bg-solo-bg/50 border-2 border-gray-700 rounded focus:border-solo-primary focus:shadow-[0_0_15px_rgba(0,234,255,0.4)] focus:outline-none transition-all text-solo-primary"
                />
            ))}
        </div>
    );
};

export default OTPInput;
