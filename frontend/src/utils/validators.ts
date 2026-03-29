/* ── Reusable pure validation functions ── */

export function validateName(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return "Name is required";
    if (trimmed.length < 2) return "Name must be at least 2 characters";
    if (trimmed.length > 100) return "Name must be under 100 characters";
    if (!/^[A-Za-z\s]+$/.test(trimmed)) return "Name can only contain letters and spaces";
    return null;
}

export function validateAge(value: string): string | null {
    if (!value.trim()) return "Age is required";
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) return "Age must be a whole number";
    if (num < 1) return "Age must be at least 1";
    if (num > 120) return "Age cannot exceed 120";
    return null;
}

export function validateDryWeight(value: string): string | null {
    if (!value.trim()) return "Dry weight is required";
    const num = Number(value);
    if (isNaN(num)) return "Dry weight must be a number";
    if (num < 10) return "Dry weight must be at least 10 kg";
    if (num > 300) return "Dry weight cannot exceed 300 kg";
    return null;
}

export function validateContactNumber(value: string): string | null {
    if (!value.trim()) return null;
    if (!/^\d{10}$/.test(value.trim())) return "Contact number must be exactly 10 digits";
    return null;
}

export function validateWeight(value: string, label: string): string | null {
    if (!value.trim()) return null;
    const num = Number(value);
    if (isNaN(num)) return `${label} must be a number`;
    if (num < 10) return `${label} must be at least 10 kg`;
    if (num > 300) return `${label} cannot exceed 300 kg`;
    return null;
}

export function validatePostWeight(postValue: string, preValue: string): string | null {
    const baseErr = validateWeight(postValue, "Post weight");
    if (baseErr) return baseErr;
    if (postValue.trim() && preValue.trim()) {
        const post = Number(postValue);
        const pre = Number(preValue);
        if (!isNaN(post) && !isNaN(pre) && post >= pre) {
            return "Post weight should be less than pre weight";
        }
    }
    return null;
}

export function validateBP(value: string): string | null {
    if (!value.trim()) return null;
    const num = Number(value);
    if (isNaN(num)) return "BP must be a number";
    if (num < 60) return "BP must be at least 60 mmHg";
    if (num > 300) return "BP cannot exceed 300 mmHg";
    return null;
}

export function validateDuration(value: string): string | null {
    if (!value.trim()) return null;
    const num = Number(value);
    if (isNaN(num)) return "Duration must be a number";
    if (num < 1) return "Duration must be at least 1 minute";
    if (num > 600) return "Duration cannot exceed 600 minutes";
    return null;
}

export function validateMachineId(value: string): string | null {
    if (!value.trim()) return null;
    if (value.trim().length > 20) return "Machine ID cannot exceed 20 characters";
    return null;
}

export function validateNurseNotes(value: string): string | null {
    if (value.length > 500) return "Notes cannot exceed 500 characters";
    return null;
}
