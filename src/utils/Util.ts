import {Store} from "@/types/store.ts";
import {v4 as uuidv4} from 'uuid';
import bs58 from "bs58";

export function handleAfterDiscount(item: Store) {
    if (item.discount) {
        return item.sellingPrice - (item.sellingPrice * item.discount) / 100;
    }
    return 0;
}

export function generateCustomUUID() {
    const uuid = uuidv4().replace(/-/g, ""); // Remove dashes from the UUID
    const bytes = Uint8Array.from(uuid.match(/.{2}/g).map(byte => parseInt(byte, 16))); // Convert to bytes
    return bs58.encode(bytes).substring(0, 22); // Base58 encode and trim to 22 chars
}

export function loggedUser() {
    let user = 'Unknown';
    const authUser = localStorage.getItem("user");
    if (authUser) {
        const parsedUser = JSON.parse(authUser);
        user = parsedUser.displayName;
    }
    return user;
}