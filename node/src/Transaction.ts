import {
    InfoOptions,
    SetOptions,
    createConfigResetStat,
    createCustomCommand,
    createDel,
    createGet,
    createInfo,
    createSelect,
    createSet
} from "./Commands";
import { redis_request } from "./ProtobufMessage";

/// Base class that includes all the shared commands in Client and ClusterClient.
export class BaseTransaction {
    readonly commands: redis_request.Command[] = [];

    /** Get the value associated with the given key, or null if no such value exists.
     *  See https://redis.io/commands/get/ for details.
     * 
     * @param key - The key to retrieve from the database.
     * @returns If the key exists, returns the value of the key as a string. Otherwise, return null.
     */
    public get(key: string) {
        this.commands.push(createGet(key));
    }

    /** Set the given key with the given value. Return value is dependent on the passed options.
     *  See https://redis.io/commands/set/ for details.
     * 
     * @param key - The key to store.
     * @param value - The value to store with the given key.
     * @param options - The set options.
     * @returns If the value is successfully set, return OK.
     *          If value isn't set because of only_if_exists or only_if_does_not_exist conditions, return null.
     *          If return_old_value is set, return the old value as a string.
     */
    public set(key: string, value: string, options?: SetOptions) {
        this.commands.push(createSet(key, value, options));
    }

    /** Get information and statistics about the Redis server.
     *  See https://redis.io/commands/info/ for details.
     * 
     * @param options - A list of InfoSection values specifying which sections of information to retrieve.
     *  When no parameter is provided, the default option is assumed.
     * @returns a string containing the information for the sections requested.
     */
    public info(options?: InfoOptions[]) {
        this.commands.push(createInfo(options));
    }

    /** Remove the specified keys. A key is ignored if it does not exist.
     *  See https://redis.io/commands/del/ for details.
     * 
     * @param keys - A list of keys to be deleted from the database. 
     * @returns the number of keys that were removed.
     */
    public del(keys: string[]) {
        this.commands.push(createDel(keys));
    }

    /** Resets the statistics reported by Redis using the INFO and LATENCY HISTOGRAM commands.
     * See https://redis.io/commands/config-resetstat/ for details.
     * 
     * Returns always "OK"
    */
    public ConfigResetStat() {
        this.commands.push(createConfigResetStat());
    }

    /** Executes a single command, without checking inputs. Every part of the command, including subcommands,
     *  should be added as a separate value in args.
     *
     * @example
     * Returns a list of all pub/sub clients:
     * ```ts
     * connection.customCommand("CLIENT", ["LIST","TYPE", "PUBSUB"])
     * ```
     */
    public customCommand(commandName: string, args: string[]) {
        return this.commands.push(createCustomCommand(commandName, args));
    }
}

/// Extends BaseTransaction class for Redis standalone commands.
export class Transaction extends BaseTransaction{
    /// TODO: add MOVE, SLAVEOF and all SENTINEL commands

    /** Change the currently selected Redis database.
     * See https://redis.io/commands/select/ for details.
     * 
     * @param index - The index of the database to select.
     * Returns A simple OK response.
     */
    public select(index: number) {
        this.commands.push(createSelect(index));
    }
}

/// Extends BaseTransaction class for cluster mode commands.
export class ClusterTransaction extends BaseTransaction{
    /// TODO: add all CLUSTER commands
}
