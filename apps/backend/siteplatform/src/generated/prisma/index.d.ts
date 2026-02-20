
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Service
 * *
 *  * Internal microservices
 */
export type Service = $Result.DefaultSelection<Prisma.$ServicePayload>
/**
 * Model ServiceRoute
 * *
 *  * Routes exposed through gateway
 */
export type ServiceRoute = $Result.DefaultSelection<Prisma.$ServiceRoutePayload>
/**
 * Model ClientApp
 * *
 *  * External client applications
 */
export type ClientApp = $Result.DefaultSelection<Prisma.$ClientAppPayload>
/**
 * Model ClientPermission
 * *
 *  * Which client can access which route
 */
export type ClientPermission = $Result.DefaultSelection<Prisma.$ClientPermissionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const HttpMethod: {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod]


export const PermissionScope: {
  READ: 'READ',
  WRITE: 'WRITE',
  FULL: 'FULL'
};

export type PermissionScope = (typeof PermissionScope)[keyof typeof PermissionScope]

}

export type HttpMethod = $Enums.HttpMethod

export const HttpMethod: typeof $Enums.HttpMethod

export type PermissionScope = $Enums.PermissionScope

export const PermissionScope: typeof $Enums.PermissionScope

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Services
 * const services = await prisma.service.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Services
   * const services = await prisma.service.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.service`: Exposes CRUD operations for the **Service** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Services
    * const services = await prisma.service.findMany()
    * ```
    */
  get service(): Prisma.ServiceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.serviceRoute`: Exposes CRUD operations for the **ServiceRoute** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ServiceRoutes
    * const serviceRoutes = await prisma.serviceRoute.findMany()
    * ```
    */
  get serviceRoute(): Prisma.ServiceRouteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.clientApp`: Exposes CRUD operations for the **ClientApp** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ClientApps
    * const clientApps = await prisma.clientApp.findMany()
    * ```
    */
  get clientApp(): Prisma.ClientAppDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.clientPermission`: Exposes CRUD operations for the **ClientPermission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ClientPermissions
    * const clientPermissions = await prisma.clientPermission.findMany()
    * ```
    */
  get clientPermission(): Prisma.ClientPermissionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.0
   * Query Engine version: ab56fe763f921d033a6c195e7ddeb3e255bdbb57
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Service: 'Service',
    ServiceRoute: 'ServiceRoute',
    ClientApp: 'ClientApp',
    ClientPermission: 'ClientPermission'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "service" | "serviceRoute" | "clientApp" | "clientPermission"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Service: {
        payload: Prisma.$ServicePayload<ExtArgs>
        fields: Prisma.ServiceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServiceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServiceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          findFirst: {
            args: Prisma.ServiceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServiceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          findMany: {
            args: Prisma.ServiceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          create: {
            args: Prisma.ServiceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          createMany: {
            args: Prisma.ServiceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ServiceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          delete: {
            args: Prisma.ServiceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          update: {
            args: Prisma.ServiceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          deleteMany: {
            args: Prisma.ServiceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServiceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ServiceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          upsert: {
            args: Prisma.ServiceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          aggregate: {
            args: Prisma.ServiceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateService>
          }
          groupBy: {
            args: Prisma.ServiceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServiceGroupByOutputType>[]
          }
          count: {
            args: Prisma.ServiceCountArgs<ExtArgs>
            result: $Utils.Optional<ServiceCountAggregateOutputType> | number
          }
        }
      }
      ServiceRoute: {
        payload: Prisma.$ServiceRoutePayload<ExtArgs>
        fields: Prisma.ServiceRouteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServiceRouteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServiceRouteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload>
          }
          findFirst: {
            args: Prisma.ServiceRouteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServiceRouteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload>
          }
          findMany: {
            args: Prisma.ServiceRouteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload>[]
          }
          create: {
            args: Prisma.ServiceRouteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload>
          }
          createMany: {
            args: Prisma.ServiceRouteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ServiceRouteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload>[]
          }
          delete: {
            args: Prisma.ServiceRouteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload>
          }
          update: {
            args: Prisma.ServiceRouteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload>
          }
          deleteMany: {
            args: Prisma.ServiceRouteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServiceRouteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ServiceRouteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload>[]
          }
          upsert: {
            args: Prisma.ServiceRouteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceRoutePayload>
          }
          aggregate: {
            args: Prisma.ServiceRouteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateServiceRoute>
          }
          groupBy: {
            args: Prisma.ServiceRouteGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServiceRouteGroupByOutputType>[]
          }
          count: {
            args: Prisma.ServiceRouteCountArgs<ExtArgs>
            result: $Utils.Optional<ServiceRouteCountAggregateOutputType> | number
          }
        }
      }
      ClientApp: {
        payload: Prisma.$ClientAppPayload<ExtArgs>
        fields: Prisma.ClientAppFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClientAppFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClientAppFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload>
          }
          findFirst: {
            args: Prisma.ClientAppFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClientAppFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload>
          }
          findMany: {
            args: Prisma.ClientAppFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload>[]
          }
          create: {
            args: Prisma.ClientAppCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload>
          }
          createMany: {
            args: Prisma.ClientAppCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClientAppCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload>[]
          }
          delete: {
            args: Prisma.ClientAppDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload>
          }
          update: {
            args: Prisma.ClientAppUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload>
          }
          deleteMany: {
            args: Prisma.ClientAppDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClientAppUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClientAppUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload>[]
          }
          upsert: {
            args: Prisma.ClientAppUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientAppPayload>
          }
          aggregate: {
            args: Prisma.ClientAppAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClientApp>
          }
          groupBy: {
            args: Prisma.ClientAppGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClientAppGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClientAppCountArgs<ExtArgs>
            result: $Utils.Optional<ClientAppCountAggregateOutputType> | number
          }
        }
      }
      ClientPermission: {
        payload: Prisma.$ClientPermissionPayload<ExtArgs>
        fields: Prisma.ClientPermissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClientPermissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClientPermissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload>
          }
          findFirst: {
            args: Prisma.ClientPermissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClientPermissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload>
          }
          findMany: {
            args: Prisma.ClientPermissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload>[]
          }
          create: {
            args: Prisma.ClientPermissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload>
          }
          createMany: {
            args: Prisma.ClientPermissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClientPermissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload>[]
          }
          delete: {
            args: Prisma.ClientPermissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload>
          }
          update: {
            args: Prisma.ClientPermissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload>
          }
          deleteMany: {
            args: Prisma.ClientPermissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClientPermissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClientPermissionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload>[]
          }
          upsert: {
            args: Prisma.ClientPermissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPermissionPayload>
          }
          aggregate: {
            args: Prisma.ClientPermissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClientPermission>
          }
          groupBy: {
            args: Prisma.ClientPermissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClientPermissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClientPermissionCountArgs<ExtArgs>
            result: $Utils.Optional<ClientPermissionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    service?: ServiceOmit
    serviceRoute?: ServiceRouteOmit
    clientApp?: ClientAppOmit
    clientPermission?: ClientPermissionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ServiceCountOutputType
   */

  export type ServiceCountOutputType = {
    routes: number
  }

  export type ServiceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    routes?: boolean | ServiceCountOutputTypeCountRoutesArgs
  }

  // Custom InputTypes
  /**
   * ServiceCountOutputType without action
   */
  export type ServiceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceCountOutputType
     */
    select?: ServiceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ServiceCountOutputType without action
   */
  export type ServiceCountOutputTypeCountRoutesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceRouteWhereInput
  }


  /**
   * Count Type ServiceRouteCountOutputType
   */

  export type ServiceRouteCountOutputType = {
    permissions: number
  }

  export type ServiceRouteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    permissions?: boolean | ServiceRouteCountOutputTypeCountPermissionsArgs
  }

  // Custom InputTypes
  /**
   * ServiceRouteCountOutputType without action
   */
  export type ServiceRouteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRouteCountOutputType
     */
    select?: ServiceRouteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ServiceRouteCountOutputType without action
   */
  export type ServiceRouteCountOutputTypeCountPermissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientPermissionWhereInput
  }


  /**
   * Count Type ClientAppCountOutputType
   */

  export type ClientAppCountOutputType = {
    permissions: number
  }

  export type ClientAppCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    permissions?: boolean | ClientAppCountOutputTypeCountPermissionsArgs
  }

  // Custom InputTypes
  /**
   * ClientAppCountOutputType without action
   */
  export type ClientAppCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientAppCountOutputType
     */
    select?: ClientAppCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClientAppCountOutputType without action
   */
  export type ClientAppCountOutputTypeCountPermissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientPermissionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Service
   */

  export type AggregateService = {
    _count: ServiceCountAggregateOutputType | null
    _min: ServiceMinAggregateOutputType | null
    _max: ServiceMaxAggregateOutputType | null
  }

  export type ServiceMinAggregateOutputType = {
    id: string | null
    name: string | null
    baseUrl: string | null
    createdAt: Date | null
  }

  export type ServiceMaxAggregateOutputType = {
    id: string | null
    name: string | null
    baseUrl: string | null
    createdAt: Date | null
  }

  export type ServiceCountAggregateOutputType = {
    id: number
    name: number
    baseUrl: number
    createdAt: number
    _all: number
  }


  export type ServiceMinAggregateInputType = {
    id?: true
    name?: true
    baseUrl?: true
    createdAt?: true
  }

  export type ServiceMaxAggregateInputType = {
    id?: true
    name?: true
    baseUrl?: true
    createdAt?: true
  }

  export type ServiceCountAggregateInputType = {
    id?: true
    name?: true
    baseUrl?: true
    createdAt?: true
    _all?: true
  }

  export type ServiceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Service to aggregate.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Services
    **/
    _count?: true | ServiceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServiceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServiceMaxAggregateInputType
  }

  export type GetServiceAggregateType<T extends ServiceAggregateArgs> = {
        [P in keyof T & keyof AggregateService]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateService[P]>
      : GetScalarType<T[P], AggregateService[P]>
  }




  export type ServiceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceWhereInput
    orderBy?: ServiceOrderByWithAggregationInput | ServiceOrderByWithAggregationInput[]
    by: ServiceScalarFieldEnum[] | ServiceScalarFieldEnum
    having?: ServiceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServiceCountAggregateInputType | true
    _min?: ServiceMinAggregateInputType
    _max?: ServiceMaxAggregateInputType
  }

  export type ServiceGroupByOutputType = {
    id: string
    name: string
    baseUrl: string
    createdAt: Date
    _count: ServiceCountAggregateOutputType | null
    _min: ServiceMinAggregateOutputType | null
    _max: ServiceMaxAggregateOutputType | null
  }

  type GetServiceGroupByPayload<T extends ServiceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServiceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServiceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServiceGroupByOutputType[P]>
            : GetScalarType<T[P], ServiceGroupByOutputType[P]>
        }
      >
    >


  export type ServiceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    baseUrl?: boolean
    createdAt?: boolean
    routes?: boolean | Service$routesArgs<ExtArgs>
    _count?: boolean | ServiceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["service"]>

  export type ServiceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    baseUrl?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["service"]>

  export type ServiceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    baseUrl?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["service"]>

  export type ServiceSelectScalar = {
    id?: boolean
    name?: boolean
    baseUrl?: boolean
    createdAt?: boolean
  }

  export type ServiceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "baseUrl" | "createdAt", ExtArgs["result"]["service"]>
  export type ServiceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    routes?: boolean | Service$routesArgs<ExtArgs>
    _count?: boolean | ServiceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ServiceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ServiceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ServicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Service"
    objects: {
      routes: Prisma.$ServiceRoutePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      baseUrl: string
      createdAt: Date
    }, ExtArgs["result"]["service"]>
    composites: {}
  }

  type ServiceGetPayload<S extends boolean | null | undefined | ServiceDefaultArgs> = $Result.GetResult<Prisma.$ServicePayload, S>

  type ServiceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ServiceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ServiceCountAggregateInputType | true
    }

  export interface ServiceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Service'], meta: { name: 'Service' } }
    /**
     * Find zero or one Service that matches the filter.
     * @param {ServiceFindUniqueArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServiceFindUniqueArgs>(args: SelectSubset<T, ServiceFindUniqueArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Service that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ServiceFindUniqueOrThrowArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServiceFindUniqueOrThrowArgs>(args: SelectSubset<T, ServiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Service that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindFirstArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServiceFindFirstArgs>(args?: SelectSubset<T, ServiceFindFirstArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Service that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindFirstOrThrowArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServiceFindFirstOrThrowArgs>(args?: SelectSubset<T, ServiceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Services that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Services
     * const services = await prisma.service.findMany()
     * 
     * // Get first 10 Services
     * const services = await prisma.service.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serviceWithIdOnly = await prisma.service.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServiceFindManyArgs>(args?: SelectSubset<T, ServiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Service.
     * @param {ServiceCreateArgs} args - Arguments to create a Service.
     * @example
     * // Create one Service
     * const Service = await prisma.service.create({
     *   data: {
     *     // ... data to create a Service
     *   }
     * })
     * 
     */
    create<T extends ServiceCreateArgs>(args: SelectSubset<T, ServiceCreateArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Services.
     * @param {ServiceCreateManyArgs} args - Arguments to create many Services.
     * @example
     * // Create many Services
     * const service = await prisma.service.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServiceCreateManyArgs>(args?: SelectSubset<T, ServiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Services and returns the data saved in the database.
     * @param {ServiceCreateManyAndReturnArgs} args - Arguments to create many Services.
     * @example
     * // Create many Services
     * const service = await prisma.service.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Services and only return the `id`
     * const serviceWithIdOnly = await prisma.service.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ServiceCreateManyAndReturnArgs>(args?: SelectSubset<T, ServiceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Service.
     * @param {ServiceDeleteArgs} args - Arguments to delete one Service.
     * @example
     * // Delete one Service
     * const Service = await prisma.service.delete({
     *   where: {
     *     // ... filter to delete one Service
     *   }
     * })
     * 
     */
    delete<T extends ServiceDeleteArgs>(args: SelectSubset<T, ServiceDeleteArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Service.
     * @param {ServiceUpdateArgs} args - Arguments to update one Service.
     * @example
     * // Update one Service
     * const service = await prisma.service.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServiceUpdateArgs>(args: SelectSubset<T, ServiceUpdateArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Services.
     * @param {ServiceDeleteManyArgs} args - Arguments to filter Services to delete.
     * @example
     * // Delete a few Services
     * const { count } = await prisma.service.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServiceDeleteManyArgs>(args?: SelectSubset<T, ServiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Services.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Services
     * const service = await prisma.service.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServiceUpdateManyArgs>(args: SelectSubset<T, ServiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Services and returns the data updated in the database.
     * @param {ServiceUpdateManyAndReturnArgs} args - Arguments to update many Services.
     * @example
     * // Update many Services
     * const service = await prisma.service.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Services and only return the `id`
     * const serviceWithIdOnly = await prisma.service.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ServiceUpdateManyAndReturnArgs>(args: SelectSubset<T, ServiceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Service.
     * @param {ServiceUpsertArgs} args - Arguments to update or create a Service.
     * @example
     * // Update or create a Service
     * const service = await prisma.service.upsert({
     *   create: {
     *     // ... data to create a Service
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Service we want to update
     *   }
     * })
     */
    upsert<T extends ServiceUpsertArgs>(args: SelectSubset<T, ServiceUpsertArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Services.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceCountArgs} args - Arguments to filter Services to count.
     * @example
     * // Count the number of Services
     * const count = await prisma.service.count({
     *   where: {
     *     // ... the filter for the Services we want to count
     *   }
     * })
    **/
    count<T extends ServiceCountArgs>(
      args?: Subset<T, ServiceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServiceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Service.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ServiceAggregateArgs>(args: Subset<T, ServiceAggregateArgs>): Prisma.PrismaPromise<GetServiceAggregateType<T>>

    /**
     * Group by Service.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ServiceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServiceGroupByArgs['orderBy'] }
        : { orderBy?: ServiceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ServiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Service model
   */
  readonly fields: ServiceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Service.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServiceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    routes<T extends Service$routesArgs<ExtArgs> = {}>(args?: Subset<T, Service$routesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Service model
   */
  interface ServiceFieldRefs {
    readonly id: FieldRef<"Service", 'String'>
    readonly name: FieldRef<"Service", 'String'>
    readonly baseUrl: FieldRef<"Service", 'String'>
    readonly createdAt: FieldRef<"Service", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Service findUnique
   */
  export type ServiceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service findUniqueOrThrow
   */
  export type ServiceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service findFirst
   */
  export type ServiceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Services.
     */
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service findFirstOrThrow
   */
  export type ServiceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Services.
     */
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service findMany
   */
  export type ServiceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Services to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service create
   */
  export type ServiceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The data needed to create a Service.
     */
    data: XOR<ServiceCreateInput, ServiceUncheckedCreateInput>
  }

  /**
   * Service createMany
   */
  export type ServiceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Services.
     */
    data: ServiceCreateManyInput | ServiceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Service createManyAndReturn
   */
  export type ServiceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * The data used to create many Services.
     */
    data: ServiceCreateManyInput | ServiceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Service update
   */
  export type ServiceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The data needed to update a Service.
     */
    data: XOR<ServiceUpdateInput, ServiceUncheckedUpdateInput>
    /**
     * Choose, which Service to update.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service updateMany
   */
  export type ServiceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Services.
     */
    data: XOR<ServiceUpdateManyMutationInput, ServiceUncheckedUpdateManyInput>
    /**
     * Filter which Services to update
     */
    where?: ServiceWhereInput
    /**
     * Limit how many Services to update.
     */
    limit?: number
  }

  /**
   * Service updateManyAndReturn
   */
  export type ServiceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * The data used to update Services.
     */
    data: XOR<ServiceUpdateManyMutationInput, ServiceUncheckedUpdateManyInput>
    /**
     * Filter which Services to update
     */
    where?: ServiceWhereInput
    /**
     * Limit how many Services to update.
     */
    limit?: number
  }

  /**
   * Service upsert
   */
  export type ServiceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The filter to search for the Service to update in case it exists.
     */
    where: ServiceWhereUniqueInput
    /**
     * In case the Service found by the `where` argument doesn't exist, create a new Service with this data.
     */
    create: XOR<ServiceCreateInput, ServiceUncheckedCreateInput>
    /**
     * In case the Service was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServiceUpdateInput, ServiceUncheckedUpdateInput>
  }

  /**
   * Service delete
   */
  export type ServiceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter which Service to delete.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service deleteMany
   */
  export type ServiceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Services to delete
     */
    where?: ServiceWhereInput
    /**
     * Limit how many Services to delete.
     */
    limit?: number
  }

  /**
   * Service.routes
   */
  export type Service$routesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    where?: ServiceRouteWhereInput
    orderBy?: ServiceRouteOrderByWithRelationInput | ServiceRouteOrderByWithRelationInput[]
    cursor?: ServiceRouteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ServiceRouteScalarFieldEnum | ServiceRouteScalarFieldEnum[]
  }

  /**
   * Service without action
   */
  export type ServiceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
  }


  /**
   * Model ServiceRoute
   */

  export type AggregateServiceRoute = {
    _count: ServiceRouteCountAggregateOutputType | null
    _min: ServiceRouteMinAggregateOutputType | null
    _max: ServiceRouteMaxAggregateOutputType | null
  }

  export type ServiceRouteMinAggregateOutputType = {
    id: string | null
    serviceId: string | null
    name: string | null
    method: $Enums.HttpMethod | null
    actualPath: string | null
    exposedPath: string | null
    createdAt: Date | null
  }

  export type ServiceRouteMaxAggregateOutputType = {
    id: string | null
    serviceId: string | null
    name: string | null
    method: $Enums.HttpMethod | null
    actualPath: string | null
    exposedPath: string | null
    createdAt: Date | null
  }

  export type ServiceRouteCountAggregateOutputType = {
    id: number
    serviceId: number
    name: number
    method: number
    actualPath: number
    exposedPath: number
    createdAt: number
    _all: number
  }


  export type ServiceRouteMinAggregateInputType = {
    id?: true
    serviceId?: true
    name?: true
    method?: true
    actualPath?: true
    exposedPath?: true
    createdAt?: true
  }

  export type ServiceRouteMaxAggregateInputType = {
    id?: true
    serviceId?: true
    name?: true
    method?: true
    actualPath?: true
    exposedPath?: true
    createdAt?: true
  }

  export type ServiceRouteCountAggregateInputType = {
    id?: true
    serviceId?: true
    name?: true
    method?: true
    actualPath?: true
    exposedPath?: true
    createdAt?: true
    _all?: true
  }

  export type ServiceRouteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServiceRoute to aggregate.
     */
    where?: ServiceRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceRoutes to fetch.
     */
    orderBy?: ServiceRouteOrderByWithRelationInput | ServiceRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServiceRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ServiceRoutes
    **/
    _count?: true | ServiceRouteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServiceRouteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServiceRouteMaxAggregateInputType
  }

  export type GetServiceRouteAggregateType<T extends ServiceRouteAggregateArgs> = {
        [P in keyof T & keyof AggregateServiceRoute]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateServiceRoute[P]>
      : GetScalarType<T[P], AggregateServiceRoute[P]>
  }




  export type ServiceRouteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceRouteWhereInput
    orderBy?: ServiceRouteOrderByWithAggregationInput | ServiceRouteOrderByWithAggregationInput[]
    by: ServiceRouteScalarFieldEnum[] | ServiceRouteScalarFieldEnum
    having?: ServiceRouteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServiceRouteCountAggregateInputType | true
    _min?: ServiceRouteMinAggregateInputType
    _max?: ServiceRouteMaxAggregateInputType
  }

  export type ServiceRouteGroupByOutputType = {
    id: string
    serviceId: string
    name: string
    method: $Enums.HttpMethod
    actualPath: string
    exposedPath: string
    createdAt: Date
    _count: ServiceRouteCountAggregateOutputType | null
    _min: ServiceRouteMinAggregateOutputType | null
    _max: ServiceRouteMaxAggregateOutputType | null
  }

  type GetServiceRouteGroupByPayload<T extends ServiceRouteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServiceRouteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServiceRouteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServiceRouteGroupByOutputType[P]>
            : GetScalarType<T[P], ServiceRouteGroupByOutputType[P]>
        }
      >
    >


  export type ServiceRouteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    serviceId?: boolean
    name?: boolean
    method?: boolean
    actualPath?: boolean
    exposedPath?: boolean
    createdAt?: boolean
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    permissions?: boolean | ServiceRoute$permissionsArgs<ExtArgs>
    _count?: boolean | ServiceRouteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["serviceRoute"]>

  export type ServiceRouteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    serviceId?: boolean
    name?: boolean
    method?: boolean
    actualPath?: boolean
    exposedPath?: boolean
    createdAt?: boolean
    service?: boolean | ServiceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["serviceRoute"]>

  export type ServiceRouteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    serviceId?: boolean
    name?: boolean
    method?: boolean
    actualPath?: boolean
    exposedPath?: boolean
    createdAt?: boolean
    service?: boolean | ServiceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["serviceRoute"]>

  export type ServiceRouteSelectScalar = {
    id?: boolean
    serviceId?: boolean
    name?: boolean
    method?: boolean
    actualPath?: boolean
    exposedPath?: boolean
    createdAt?: boolean
  }

  export type ServiceRouteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "serviceId" | "name" | "method" | "actualPath" | "exposedPath" | "createdAt", ExtArgs["result"]["serviceRoute"]>
  export type ServiceRouteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    permissions?: boolean | ServiceRoute$permissionsArgs<ExtArgs>
    _count?: boolean | ServiceRouteCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ServiceRouteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    service?: boolean | ServiceDefaultArgs<ExtArgs>
  }
  export type ServiceRouteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    service?: boolean | ServiceDefaultArgs<ExtArgs>
  }

  export type $ServiceRoutePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ServiceRoute"
    objects: {
      service: Prisma.$ServicePayload<ExtArgs>
      permissions: Prisma.$ClientPermissionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      serviceId: string
      name: string
      method: $Enums.HttpMethod
      actualPath: string
      exposedPath: string
      createdAt: Date
    }, ExtArgs["result"]["serviceRoute"]>
    composites: {}
  }

  type ServiceRouteGetPayload<S extends boolean | null | undefined | ServiceRouteDefaultArgs> = $Result.GetResult<Prisma.$ServiceRoutePayload, S>

  type ServiceRouteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ServiceRouteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ServiceRouteCountAggregateInputType | true
    }

  export interface ServiceRouteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ServiceRoute'], meta: { name: 'ServiceRoute' } }
    /**
     * Find zero or one ServiceRoute that matches the filter.
     * @param {ServiceRouteFindUniqueArgs} args - Arguments to find a ServiceRoute
     * @example
     * // Get one ServiceRoute
     * const serviceRoute = await prisma.serviceRoute.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServiceRouteFindUniqueArgs>(args: SelectSubset<T, ServiceRouteFindUniqueArgs<ExtArgs>>): Prisma__ServiceRouteClient<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ServiceRoute that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ServiceRouteFindUniqueOrThrowArgs} args - Arguments to find a ServiceRoute
     * @example
     * // Get one ServiceRoute
     * const serviceRoute = await prisma.serviceRoute.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServiceRouteFindUniqueOrThrowArgs>(args: SelectSubset<T, ServiceRouteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServiceRouteClient<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ServiceRoute that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceRouteFindFirstArgs} args - Arguments to find a ServiceRoute
     * @example
     * // Get one ServiceRoute
     * const serviceRoute = await prisma.serviceRoute.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServiceRouteFindFirstArgs>(args?: SelectSubset<T, ServiceRouteFindFirstArgs<ExtArgs>>): Prisma__ServiceRouteClient<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ServiceRoute that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceRouteFindFirstOrThrowArgs} args - Arguments to find a ServiceRoute
     * @example
     * // Get one ServiceRoute
     * const serviceRoute = await prisma.serviceRoute.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServiceRouteFindFirstOrThrowArgs>(args?: SelectSubset<T, ServiceRouteFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServiceRouteClient<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ServiceRoutes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceRouteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ServiceRoutes
     * const serviceRoutes = await prisma.serviceRoute.findMany()
     * 
     * // Get first 10 ServiceRoutes
     * const serviceRoutes = await prisma.serviceRoute.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serviceRouteWithIdOnly = await prisma.serviceRoute.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServiceRouteFindManyArgs>(args?: SelectSubset<T, ServiceRouteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ServiceRoute.
     * @param {ServiceRouteCreateArgs} args - Arguments to create a ServiceRoute.
     * @example
     * // Create one ServiceRoute
     * const ServiceRoute = await prisma.serviceRoute.create({
     *   data: {
     *     // ... data to create a ServiceRoute
     *   }
     * })
     * 
     */
    create<T extends ServiceRouteCreateArgs>(args: SelectSubset<T, ServiceRouteCreateArgs<ExtArgs>>): Prisma__ServiceRouteClient<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ServiceRoutes.
     * @param {ServiceRouteCreateManyArgs} args - Arguments to create many ServiceRoutes.
     * @example
     * // Create many ServiceRoutes
     * const serviceRoute = await prisma.serviceRoute.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServiceRouteCreateManyArgs>(args?: SelectSubset<T, ServiceRouteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ServiceRoutes and returns the data saved in the database.
     * @param {ServiceRouteCreateManyAndReturnArgs} args - Arguments to create many ServiceRoutes.
     * @example
     * // Create many ServiceRoutes
     * const serviceRoute = await prisma.serviceRoute.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ServiceRoutes and only return the `id`
     * const serviceRouteWithIdOnly = await prisma.serviceRoute.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ServiceRouteCreateManyAndReturnArgs>(args?: SelectSubset<T, ServiceRouteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ServiceRoute.
     * @param {ServiceRouteDeleteArgs} args - Arguments to delete one ServiceRoute.
     * @example
     * // Delete one ServiceRoute
     * const ServiceRoute = await prisma.serviceRoute.delete({
     *   where: {
     *     // ... filter to delete one ServiceRoute
     *   }
     * })
     * 
     */
    delete<T extends ServiceRouteDeleteArgs>(args: SelectSubset<T, ServiceRouteDeleteArgs<ExtArgs>>): Prisma__ServiceRouteClient<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ServiceRoute.
     * @param {ServiceRouteUpdateArgs} args - Arguments to update one ServiceRoute.
     * @example
     * // Update one ServiceRoute
     * const serviceRoute = await prisma.serviceRoute.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServiceRouteUpdateArgs>(args: SelectSubset<T, ServiceRouteUpdateArgs<ExtArgs>>): Prisma__ServiceRouteClient<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ServiceRoutes.
     * @param {ServiceRouteDeleteManyArgs} args - Arguments to filter ServiceRoutes to delete.
     * @example
     * // Delete a few ServiceRoutes
     * const { count } = await prisma.serviceRoute.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServiceRouteDeleteManyArgs>(args?: SelectSubset<T, ServiceRouteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ServiceRoutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceRouteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ServiceRoutes
     * const serviceRoute = await prisma.serviceRoute.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServiceRouteUpdateManyArgs>(args: SelectSubset<T, ServiceRouteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ServiceRoutes and returns the data updated in the database.
     * @param {ServiceRouteUpdateManyAndReturnArgs} args - Arguments to update many ServiceRoutes.
     * @example
     * // Update many ServiceRoutes
     * const serviceRoute = await prisma.serviceRoute.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ServiceRoutes and only return the `id`
     * const serviceRouteWithIdOnly = await prisma.serviceRoute.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ServiceRouteUpdateManyAndReturnArgs>(args: SelectSubset<T, ServiceRouteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ServiceRoute.
     * @param {ServiceRouteUpsertArgs} args - Arguments to update or create a ServiceRoute.
     * @example
     * // Update or create a ServiceRoute
     * const serviceRoute = await prisma.serviceRoute.upsert({
     *   create: {
     *     // ... data to create a ServiceRoute
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ServiceRoute we want to update
     *   }
     * })
     */
    upsert<T extends ServiceRouteUpsertArgs>(args: SelectSubset<T, ServiceRouteUpsertArgs<ExtArgs>>): Prisma__ServiceRouteClient<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ServiceRoutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceRouteCountArgs} args - Arguments to filter ServiceRoutes to count.
     * @example
     * // Count the number of ServiceRoutes
     * const count = await prisma.serviceRoute.count({
     *   where: {
     *     // ... the filter for the ServiceRoutes we want to count
     *   }
     * })
    **/
    count<T extends ServiceRouteCountArgs>(
      args?: Subset<T, ServiceRouteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServiceRouteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ServiceRoute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceRouteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ServiceRouteAggregateArgs>(args: Subset<T, ServiceRouteAggregateArgs>): Prisma.PrismaPromise<GetServiceRouteAggregateType<T>>

    /**
     * Group by ServiceRoute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceRouteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ServiceRouteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServiceRouteGroupByArgs['orderBy'] }
        : { orderBy?: ServiceRouteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ServiceRouteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceRouteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ServiceRoute model
   */
  readonly fields: ServiceRouteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ServiceRoute.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServiceRouteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    service<T extends ServiceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ServiceDefaultArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    permissions<T extends ServiceRoute$permissionsArgs<ExtArgs> = {}>(args?: Subset<T, ServiceRoute$permissionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ServiceRoute model
   */
  interface ServiceRouteFieldRefs {
    readonly id: FieldRef<"ServiceRoute", 'String'>
    readonly serviceId: FieldRef<"ServiceRoute", 'String'>
    readonly name: FieldRef<"ServiceRoute", 'String'>
    readonly method: FieldRef<"ServiceRoute", 'HttpMethod'>
    readonly actualPath: FieldRef<"ServiceRoute", 'String'>
    readonly exposedPath: FieldRef<"ServiceRoute", 'String'>
    readonly createdAt: FieldRef<"ServiceRoute", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ServiceRoute findUnique
   */
  export type ServiceRouteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    /**
     * Filter, which ServiceRoute to fetch.
     */
    where: ServiceRouteWhereUniqueInput
  }

  /**
   * ServiceRoute findUniqueOrThrow
   */
  export type ServiceRouteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    /**
     * Filter, which ServiceRoute to fetch.
     */
    where: ServiceRouteWhereUniqueInput
  }

  /**
   * ServiceRoute findFirst
   */
  export type ServiceRouteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    /**
     * Filter, which ServiceRoute to fetch.
     */
    where?: ServiceRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceRoutes to fetch.
     */
    orderBy?: ServiceRouteOrderByWithRelationInput | ServiceRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServiceRoutes.
     */
    cursor?: ServiceRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServiceRoutes.
     */
    distinct?: ServiceRouteScalarFieldEnum | ServiceRouteScalarFieldEnum[]
  }

  /**
   * ServiceRoute findFirstOrThrow
   */
  export type ServiceRouteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    /**
     * Filter, which ServiceRoute to fetch.
     */
    where?: ServiceRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceRoutes to fetch.
     */
    orderBy?: ServiceRouteOrderByWithRelationInput | ServiceRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServiceRoutes.
     */
    cursor?: ServiceRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServiceRoutes.
     */
    distinct?: ServiceRouteScalarFieldEnum | ServiceRouteScalarFieldEnum[]
  }

  /**
   * ServiceRoute findMany
   */
  export type ServiceRouteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    /**
     * Filter, which ServiceRoutes to fetch.
     */
    where?: ServiceRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceRoutes to fetch.
     */
    orderBy?: ServiceRouteOrderByWithRelationInput | ServiceRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ServiceRoutes.
     */
    cursor?: ServiceRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceRoutes.
     */
    skip?: number
    distinct?: ServiceRouteScalarFieldEnum | ServiceRouteScalarFieldEnum[]
  }

  /**
   * ServiceRoute create
   */
  export type ServiceRouteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    /**
     * The data needed to create a ServiceRoute.
     */
    data: XOR<ServiceRouteCreateInput, ServiceRouteUncheckedCreateInput>
  }

  /**
   * ServiceRoute createMany
   */
  export type ServiceRouteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ServiceRoutes.
     */
    data: ServiceRouteCreateManyInput | ServiceRouteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ServiceRoute createManyAndReturn
   */
  export type ServiceRouteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * The data used to create many ServiceRoutes.
     */
    data: ServiceRouteCreateManyInput | ServiceRouteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ServiceRoute update
   */
  export type ServiceRouteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    /**
     * The data needed to update a ServiceRoute.
     */
    data: XOR<ServiceRouteUpdateInput, ServiceRouteUncheckedUpdateInput>
    /**
     * Choose, which ServiceRoute to update.
     */
    where: ServiceRouteWhereUniqueInput
  }

  /**
   * ServiceRoute updateMany
   */
  export type ServiceRouteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ServiceRoutes.
     */
    data: XOR<ServiceRouteUpdateManyMutationInput, ServiceRouteUncheckedUpdateManyInput>
    /**
     * Filter which ServiceRoutes to update
     */
    where?: ServiceRouteWhereInput
    /**
     * Limit how many ServiceRoutes to update.
     */
    limit?: number
  }

  /**
   * ServiceRoute updateManyAndReturn
   */
  export type ServiceRouteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * The data used to update ServiceRoutes.
     */
    data: XOR<ServiceRouteUpdateManyMutationInput, ServiceRouteUncheckedUpdateManyInput>
    /**
     * Filter which ServiceRoutes to update
     */
    where?: ServiceRouteWhereInput
    /**
     * Limit how many ServiceRoutes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ServiceRoute upsert
   */
  export type ServiceRouteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    /**
     * The filter to search for the ServiceRoute to update in case it exists.
     */
    where: ServiceRouteWhereUniqueInput
    /**
     * In case the ServiceRoute found by the `where` argument doesn't exist, create a new ServiceRoute with this data.
     */
    create: XOR<ServiceRouteCreateInput, ServiceRouteUncheckedCreateInput>
    /**
     * In case the ServiceRoute was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServiceRouteUpdateInput, ServiceRouteUncheckedUpdateInput>
  }

  /**
   * ServiceRoute delete
   */
  export type ServiceRouteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
    /**
     * Filter which ServiceRoute to delete.
     */
    where: ServiceRouteWhereUniqueInput
  }

  /**
   * ServiceRoute deleteMany
   */
  export type ServiceRouteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServiceRoutes to delete
     */
    where?: ServiceRouteWhereInput
    /**
     * Limit how many ServiceRoutes to delete.
     */
    limit?: number
  }

  /**
   * ServiceRoute.permissions
   */
  export type ServiceRoute$permissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    where?: ClientPermissionWhereInput
    orderBy?: ClientPermissionOrderByWithRelationInput | ClientPermissionOrderByWithRelationInput[]
    cursor?: ClientPermissionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClientPermissionScalarFieldEnum | ClientPermissionScalarFieldEnum[]
  }

  /**
   * ServiceRoute without action
   */
  export type ServiceRouteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceRoute
     */
    select?: ServiceRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceRoute
     */
    omit?: ServiceRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceRouteInclude<ExtArgs> | null
  }


  /**
   * Model ClientApp
   */

  export type AggregateClientApp = {
    _count: ClientAppCountAggregateOutputType | null
    _min: ClientAppMinAggregateOutputType | null
    _max: ClientAppMaxAggregateOutputType | null
  }

  export type ClientAppMinAggregateOutputType = {
    id: string | null
    name: string | null
    secret: string | null
    createdAt: Date | null
  }

  export type ClientAppMaxAggregateOutputType = {
    id: string | null
    name: string | null
    secret: string | null
    createdAt: Date | null
  }

  export type ClientAppCountAggregateOutputType = {
    id: number
    name: number
    secret: number
    createdAt: number
    _all: number
  }


  export type ClientAppMinAggregateInputType = {
    id?: true
    name?: true
    secret?: true
    createdAt?: true
  }

  export type ClientAppMaxAggregateInputType = {
    id?: true
    name?: true
    secret?: true
    createdAt?: true
  }

  export type ClientAppCountAggregateInputType = {
    id?: true
    name?: true
    secret?: true
    createdAt?: true
    _all?: true
  }

  export type ClientAppAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClientApp to aggregate.
     */
    where?: ClientAppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientApps to fetch.
     */
    orderBy?: ClientAppOrderByWithRelationInput | ClientAppOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClientAppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientApps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientApps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ClientApps
    **/
    _count?: true | ClientAppCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClientAppMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClientAppMaxAggregateInputType
  }

  export type GetClientAppAggregateType<T extends ClientAppAggregateArgs> = {
        [P in keyof T & keyof AggregateClientApp]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClientApp[P]>
      : GetScalarType<T[P], AggregateClientApp[P]>
  }




  export type ClientAppGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientAppWhereInput
    orderBy?: ClientAppOrderByWithAggregationInput | ClientAppOrderByWithAggregationInput[]
    by: ClientAppScalarFieldEnum[] | ClientAppScalarFieldEnum
    having?: ClientAppScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClientAppCountAggregateInputType | true
    _min?: ClientAppMinAggregateInputType
    _max?: ClientAppMaxAggregateInputType
  }

  export type ClientAppGroupByOutputType = {
    id: string
    name: string
    secret: string
    createdAt: Date
    _count: ClientAppCountAggregateOutputType | null
    _min: ClientAppMinAggregateOutputType | null
    _max: ClientAppMaxAggregateOutputType | null
  }

  type GetClientAppGroupByPayload<T extends ClientAppGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClientAppGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClientAppGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClientAppGroupByOutputType[P]>
            : GetScalarType<T[P], ClientAppGroupByOutputType[P]>
        }
      >
    >


  export type ClientAppSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    secret?: boolean
    createdAt?: boolean
    permissions?: boolean | ClientApp$permissionsArgs<ExtArgs>
    _count?: boolean | ClientAppCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clientApp"]>

  export type ClientAppSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    secret?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["clientApp"]>

  export type ClientAppSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    secret?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["clientApp"]>

  export type ClientAppSelectScalar = {
    id?: boolean
    name?: boolean
    secret?: boolean
    createdAt?: boolean
  }

  export type ClientAppOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "secret" | "createdAt", ExtArgs["result"]["clientApp"]>
  export type ClientAppInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    permissions?: boolean | ClientApp$permissionsArgs<ExtArgs>
    _count?: boolean | ClientAppCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClientAppIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ClientAppIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ClientAppPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ClientApp"
    objects: {
      permissions: Prisma.$ClientPermissionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      secret: string
      createdAt: Date
    }, ExtArgs["result"]["clientApp"]>
    composites: {}
  }

  type ClientAppGetPayload<S extends boolean | null | undefined | ClientAppDefaultArgs> = $Result.GetResult<Prisma.$ClientAppPayload, S>

  type ClientAppCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClientAppFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClientAppCountAggregateInputType | true
    }

  export interface ClientAppDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ClientApp'], meta: { name: 'ClientApp' } }
    /**
     * Find zero or one ClientApp that matches the filter.
     * @param {ClientAppFindUniqueArgs} args - Arguments to find a ClientApp
     * @example
     * // Get one ClientApp
     * const clientApp = await prisma.clientApp.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClientAppFindUniqueArgs>(args: SelectSubset<T, ClientAppFindUniqueArgs<ExtArgs>>): Prisma__ClientAppClient<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ClientApp that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClientAppFindUniqueOrThrowArgs} args - Arguments to find a ClientApp
     * @example
     * // Get one ClientApp
     * const clientApp = await prisma.clientApp.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClientAppFindUniqueOrThrowArgs>(args: SelectSubset<T, ClientAppFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClientAppClient<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClientApp that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAppFindFirstArgs} args - Arguments to find a ClientApp
     * @example
     * // Get one ClientApp
     * const clientApp = await prisma.clientApp.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClientAppFindFirstArgs>(args?: SelectSubset<T, ClientAppFindFirstArgs<ExtArgs>>): Prisma__ClientAppClient<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClientApp that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAppFindFirstOrThrowArgs} args - Arguments to find a ClientApp
     * @example
     * // Get one ClientApp
     * const clientApp = await prisma.clientApp.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClientAppFindFirstOrThrowArgs>(args?: SelectSubset<T, ClientAppFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClientAppClient<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ClientApps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAppFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ClientApps
     * const clientApps = await prisma.clientApp.findMany()
     * 
     * // Get first 10 ClientApps
     * const clientApps = await prisma.clientApp.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clientAppWithIdOnly = await prisma.clientApp.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClientAppFindManyArgs>(args?: SelectSubset<T, ClientAppFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ClientApp.
     * @param {ClientAppCreateArgs} args - Arguments to create a ClientApp.
     * @example
     * // Create one ClientApp
     * const ClientApp = await prisma.clientApp.create({
     *   data: {
     *     // ... data to create a ClientApp
     *   }
     * })
     * 
     */
    create<T extends ClientAppCreateArgs>(args: SelectSubset<T, ClientAppCreateArgs<ExtArgs>>): Prisma__ClientAppClient<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ClientApps.
     * @param {ClientAppCreateManyArgs} args - Arguments to create many ClientApps.
     * @example
     * // Create many ClientApps
     * const clientApp = await prisma.clientApp.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClientAppCreateManyArgs>(args?: SelectSubset<T, ClientAppCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ClientApps and returns the data saved in the database.
     * @param {ClientAppCreateManyAndReturnArgs} args - Arguments to create many ClientApps.
     * @example
     * // Create many ClientApps
     * const clientApp = await prisma.clientApp.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ClientApps and only return the `id`
     * const clientAppWithIdOnly = await prisma.clientApp.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClientAppCreateManyAndReturnArgs>(args?: SelectSubset<T, ClientAppCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ClientApp.
     * @param {ClientAppDeleteArgs} args - Arguments to delete one ClientApp.
     * @example
     * // Delete one ClientApp
     * const ClientApp = await prisma.clientApp.delete({
     *   where: {
     *     // ... filter to delete one ClientApp
     *   }
     * })
     * 
     */
    delete<T extends ClientAppDeleteArgs>(args: SelectSubset<T, ClientAppDeleteArgs<ExtArgs>>): Prisma__ClientAppClient<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ClientApp.
     * @param {ClientAppUpdateArgs} args - Arguments to update one ClientApp.
     * @example
     * // Update one ClientApp
     * const clientApp = await prisma.clientApp.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClientAppUpdateArgs>(args: SelectSubset<T, ClientAppUpdateArgs<ExtArgs>>): Prisma__ClientAppClient<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ClientApps.
     * @param {ClientAppDeleteManyArgs} args - Arguments to filter ClientApps to delete.
     * @example
     * // Delete a few ClientApps
     * const { count } = await prisma.clientApp.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClientAppDeleteManyArgs>(args?: SelectSubset<T, ClientAppDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClientApps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAppUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ClientApps
     * const clientApp = await prisma.clientApp.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClientAppUpdateManyArgs>(args: SelectSubset<T, ClientAppUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClientApps and returns the data updated in the database.
     * @param {ClientAppUpdateManyAndReturnArgs} args - Arguments to update many ClientApps.
     * @example
     * // Update many ClientApps
     * const clientApp = await prisma.clientApp.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ClientApps and only return the `id`
     * const clientAppWithIdOnly = await prisma.clientApp.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClientAppUpdateManyAndReturnArgs>(args: SelectSubset<T, ClientAppUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ClientApp.
     * @param {ClientAppUpsertArgs} args - Arguments to update or create a ClientApp.
     * @example
     * // Update or create a ClientApp
     * const clientApp = await prisma.clientApp.upsert({
     *   create: {
     *     // ... data to create a ClientApp
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ClientApp we want to update
     *   }
     * })
     */
    upsert<T extends ClientAppUpsertArgs>(args: SelectSubset<T, ClientAppUpsertArgs<ExtArgs>>): Prisma__ClientAppClient<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ClientApps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAppCountArgs} args - Arguments to filter ClientApps to count.
     * @example
     * // Count the number of ClientApps
     * const count = await prisma.clientApp.count({
     *   where: {
     *     // ... the filter for the ClientApps we want to count
     *   }
     * })
    **/
    count<T extends ClientAppCountArgs>(
      args?: Subset<T, ClientAppCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClientAppCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ClientApp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAppAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClientAppAggregateArgs>(args: Subset<T, ClientAppAggregateArgs>): Prisma.PrismaPromise<GetClientAppAggregateType<T>>

    /**
     * Group by ClientApp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAppGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClientAppGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClientAppGroupByArgs['orderBy'] }
        : { orderBy?: ClientAppGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClientAppGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientAppGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ClientApp model
   */
  readonly fields: ClientAppFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ClientApp.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClientAppClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    permissions<T extends ClientApp$permissionsArgs<ExtArgs> = {}>(args?: Subset<T, ClientApp$permissionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ClientApp model
   */
  interface ClientAppFieldRefs {
    readonly id: FieldRef<"ClientApp", 'String'>
    readonly name: FieldRef<"ClientApp", 'String'>
    readonly secret: FieldRef<"ClientApp", 'String'>
    readonly createdAt: FieldRef<"ClientApp", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ClientApp findUnique
   */
  export type ClientAppFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
    /**
     * Filter, which ClientApp to fetch.
     */
    where: ClientAppWhereUniqueInput
  }

  /**
   * ClientApp findUniqueOrThrow
   */
  export type ClientAppFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
    /**
     * Filter, which ClientApp to fetch.
     */
    where: ClientAppWhereUniqueInput
  }

  /**
   * ClientApp findFirst
   */
  export type ClientAppFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
    /**
     * Filter, which ClientApp to fetch.
     */
    where?: ClientAppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientApps to fetch.
     */
    orderBy?: ClientAppOrderByWithRelationInput | ClientAppOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClientApps.
     */
    cursor?: ClientAppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientApps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientApps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClientApps.
     */
    distinct?: ClientAppScalarFieldEnum | ClientAppScalarFieldEnum[]
  }

  /**
   * ClientApp findFirstOrThrow
   */
  export type ClientAppFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
    /**
     * Filter, which ClientApp to fetch.
     */
    where?: ClientAppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientApps to fetch.
     */
    orderBy?: ClientAppOrderByWithRelationInput | ClientAppOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClientApps.
     */
    cursor?: ClientAppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientApps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientApps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClientApps.
     */
    distinct?: ClientAppScalarFieldEnum | ClientAppScalarFieldEnum[]
  }

  /**
   * ClientApp findMany
   */
  export type ClientAppFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
    /**
     * Filter, which ClientApps to fetch.
     */
    where?: ClientAppWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientApps to fetch.
     */
    orderBy?: ClientAppOrderByWithRelationInput | ClientAppOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ClientApps.
     */
    cursor?: ClientAppWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientApps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientApps.
     */
    skip?: number
    distinct?: ClientAppScalarFieldEnum | ClientAppScalarFieldEnum[]
  }

  /**
   * ClientApp create
   */
  export type ClientAppCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
    /**
     * The data needed to create a ClientApp.
     */
    data: XOR<ClientAppCreateInput, ClientAppUncheckedCreateInput>
  }

  /**
   * ClientApp createMany
   */
  export type ClientAppCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ClientApps.
     */
    data: ClientAppCreateManyInput | ClientAppCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ClientApp createManyAndReturn
   */
  export type ClientAppCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * The data used to create many ClientApps.
     */
    data: ClientAppCreateManyInput | ClientAppCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ClientApp update
   */
  export type ClientAppUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
    /**
     * The data needed to update a ClientApp.
     */
    data: XOR<ClientAppUpdateInput, ClientAppUncheckedUpdateInput>
    /**
     * Choose, which ClientApp to update.
     */
    where: ClientAppWhereUniqueInput
  }

  /**
   * ClientApp updateMany
   */
  export type ClientAppUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ClientApps.
     */
    data: XOR<ClientAppUpdateManyMutationInput, ClientAppUncheckedUpdateManyInput>
    /**
     * Filter which ClientApps to update
     */
    where?: ClientAppWhereInput
    /**
     * Limit how many ClientApps to update.
     */
    limit?: number
  }

  /**
   * ClientApp updateManyAndReturn
   */
  export type ClientAppUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * The data used to update ClientApps.
     */
    data: XOR<ClientAppUpdateManyMutationInput, ClientAppUncheckedUpdateManyInput>
    /**
     * Filter which ClientApps to update
     */
    where?: ClientAppWhereInput
    /**
     * Limit how many ClientApps to update.
     */
    limit?: number
  }

  /**
   * ClientApp upsert
   */
  export type ClientAppUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
    /**
     * The filter to search for the ClientApp to update in case it exists.
     */
    where: ClientAppWhereUniqueInput
    /**
     * In case the ClientApp found by the `where` argument doesn't exist, create a new ClientApp with this data.
     */
    create: XOR<ClientAppCreateInput, ClientAppUncheckedCreateInput>
    /**
     * In case the ClientApp was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClientAppUpdateInput, ClientAppUncheckedUpdateInput>
  }

  /**
   * ClientApp delete
   */
  export type ClientAppDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
    /**
     * Filter which ClientApp to delete.
     */
    where: ClientAppWhereUniqueInput
  }

  /**
   * ClientApp deleteMany
   */
  export type ClientAppDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClientApps to delete
     */
    where?: ClientAppWhereInput
    /**
     * Limit how many ClientApps to delete.
     */
    limit?: number
  }

  /**
   * ClientApp.permissions
   */
  export type ClientApp$permissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    where?: ClientPermissionWhereInput
    orderBy?: ClientPermissionOrderByWithRelationInput | ClientPermissionOrderByWithRelationInput[]
    cursor?: ClientPermissionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClientPermissionScalarFieldEnum | ClientPermissionScalarFieldEnum[]
  }

  /**
   * ClientApp without action
   */
  export type ClientAppDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientApp
     */
    select?: ClientAppSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientApp
     */
    omit?: ClientAppOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientAppInclude<ExtArgs> | null
  }


  /**
   * Model ClientPermission
   */

  export type AggregateClientPermission = {
    _count: ClientPermissionCountAggregateOutputType | null
    _min: ClientPermissionMinAggregateOutputType | null
    _max: ClientPermissionMaxAggregateOutputType | null
  }

  export type ClientPermissionMinAggregateOutputType = {
    id: string | null
    clientId: string | null
    routeId: string | null
    scope: $Enums.PermissionScope | null
  }

  export type ClientPermissionMaxAggregateOutputType = {
    id: string | null
    clientId: string | null
    routeId: string | null
    scope: $Enums.PermissionScope | null
  }

  export type ClientPermissionCountAggregateOutputType = {
    id: number
    clientId: number
    routeId: number
    scope: number
    _all: number
  }


  export type ClientPermissionMinAggregateInputType = {
    id?: true
    clientId?: true
    routeId?: true
    scope?: true
  }

  export type ClientPermissionMaxAggregateInputType = {
    id?: true
    clientId?: true
    routeId?: true
    scope?: true
  }

  export type ClientPermissionCountAggregateInputType = {
    id?: true
    clientId?: true
    routeId?: true
    scope?: true
    _all?: true
  }

  export type ClientPermissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClientPermission to aggregate.
     */
    where?: ClientPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientPermissions to fetch.
     */
    orderBy?: ClientPermissionOrderByWithRelationInput | ClientPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClientPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ClientPermissions
    **/
    _count?: true | ClientPermissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClientPermissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClientPermissionMaxAggregateInputType
  }

  export type GetClientPermissionAggregateType<T extends ClientPermissionAggregateArgs> = {
        [P in keyof T & keyof AggregateClientPermission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClientPermission[P]>
      : GetScalarType<T[P], AggregateClientPermission[P]>
  }




  export type ClientPermissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientPermissionWhereInput
    orderBy?: ClientPermissionOrderByWithAggregationInput | ClientPermissionOrderByWithAggregationInput[]
    by: ClientPermissionScalarFieldEnum[] | ClientPermissionScalarFieldEnum
    having?: ClientPermissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClientPermissionCountAggregateInputType | true
    _min?: ClientPermissionMinAggregateInputType
    _max?: ClientPermissionMaxAggregateInputType
  }

  export type ClientPermissionGroupByOutputType = {
    id: string
    clientId: string
    routeId: string
    scope: $Enums.PermissionScope
    _count: ClientPermissionCountAggregateOutputType | null
    _min: ClientPermissionMinAggregateOutputType | null
    _max: ClientPermissionMaxAggregateOutputType | null
  }

  type GetClientPermissionGroupByPayload<T extends ClientPermissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClientPermissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClientPermissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClientPermissionGroupByOutputType[P]>
            : GetScalarType<T[P], ClientPermissionGroupByOutputType[P]>
        }
      >
    >


  export type ClientPermissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clientId?: boolean
    routeId?: boolean
    scope?: boolean
    client?: boolean | ClientAppDefaultArgs<ExtArgs>
    route?: boolean | ServiceRouteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clientPermission"]>

  export type ClientPermissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clientId?: boolean
    routeId?: boolean
    scope?: boolean
    client?: boolean | ClientAppDefaultArgs<ExtArgs>
    route?: boolean | ServiceRouteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clientPermission"]>

  export type ClientPermissionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clientId?: boolean
    routeId?: boolean
    scope?: boolean
    client?: boolean | ClientAppDefaultArgs<ExtArgs>
    route?: boolean | ServiceRouteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clientPermission"]>

  export type ClientPermissionSelectScalar = {
    id?: boolean
    clientId?: boolean
    routeId?: boolean
    scope?: boolean
  }

  export type ClientPermissionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "clientId" | "routeId" | "scope", ExtArgs["result"]["clientPermission"]>
  export type ClientPermissionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | ClientAppDefaultArgs<ExtArgs>
    route?: boolean | ServiceRouteDefaultArgs<ExtArgs>
  }
  export type ClientPermissionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | ClientAppDefaultArgs<ExtArgs>
    route?: boolean | ServiceRouteDefaultArgs<ExtArgs>
  }
  export type ClientPermissionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    client?: boolean | ClientAppDefaultArgs<ExtArgs>
    route?: boolean | ServiceRouteDefaultArgs<ExtArgs>
  }

  export type $ClientPermissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ClientPermission"
    objects: {
      client: Prisma.$ClientAppPayload<ExtArgs>
      route: Prisma.$ServiceRoutePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clientId: string
      routeId: string
      scope: $Enums.PermissionScope
    }, ExtArgs["result"]["clientPermission"]>
    composites: {}
  }

  type ClientPermissionGetPayload<S extends boolean | null | undefined | ClientPermissionDefaultArgs> = $Result.GetResult<Prisma.$ClientPermissionPayload, S>

  type ClientPermissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClientPermissionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClientPermissionCountAggregateInputType | true
    }

  export interface ClientPermissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ClientPermission'], meta: { name: 'ClientPermission' } }
    /**
     * Find zero or one ClientPermission that matches the filter.
     * @param {ClientPermissionFindUniqueArgs} args - Arguments to find a ClientPermission
     * @example
     * // Get one ClientPermission
     * const clientPermission = await prisma.clientPermission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClientPermissionFindUniqueArgs>(args: SelectSubset<T, ClientPermissionFindUniqueArgs<ExtArgs>>): Prisma__ClientPermissionClient<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ClientPermission that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClientPermissionFindUniqueOrThrowArgs} args - Arguments to find a ClientPermission
     * @example
     * // Get one ClientPermission
     * const clientPermission = await prisma.clientPermission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClientPermissionFindUniqueOrThrowArgs>(args: SelectSubset<T, ClientPermissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClientPermissionClient<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClientPermission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientPermissionFindFirstArgs} args - Arguments to find a ClientPermission
     * @example
     * // Get one ClientPermission
     * const clientPermission = await prisma.clientPermission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClientPermissionFindFirstArgs>(args?: SelectSubset<T, ClientPermissionFindFirstArgs<ExtArgs>>): Prisma__ClientPermissionClient<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClientPermission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientPermissionFindFirstOrThrowArgs} args - Arguments to find a ClientPermission
     * @example
     * // Get one ClientPermission
     * const clientPermission = await prisma.clientPermission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClientPermissionFindFirstOrThrowArgs>(args?: SelectSubset<T, ClientPermissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClientPermissionClient<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ClientPermissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientPermissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ClientPermissions
     * const clientPermissions = await prisma.clientPermission.findMany()
     * 
     * // Get first 10 ClientPermissions
     * const clientPermissions = await prisma.clientPermission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clientPermissionWithIdOnly = await prisma.clientPermission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClientPermissionFindManyArgs>(args?: SelectSubset<T, ClientPermissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ClientPermission.
     * @param {ClientPermissionCreateArgs} args - Arguments to create a ClientPermission.
     * @example
     * // Create one ClientPermission
     * const ClientPermission = await prisma.clientPermission.create({
     *   data: {
     *     // ... data to create a ClientPermission
     *   }
     * })
     * 
     */
    create<T extends ClientPermissionCreateArgs>(args: SelectSubset<T, ClientPermissionCreateArgs<ExtArgs>>): Prisma__ClientPermissionClient<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ClientPermissions.
     * @param {ClientPermissionCreateManyArgs} args - Arguments to create many ClientPermissions.
     * @example
     * // Create many ClientPermissions
     * const clientPermission = await prisma.clientPermission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClientPermissionCreateManyArgs>(args?: SelectSubset<T, ClientPermissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ClientPermissions and returns the data saved in the database.
     * @param {ClientPermissionCreateManyAndReturnArgs} args - Arguments to create many ClientPermissions.
     * @example
     * // Create many ClientPermissions
     * const clientPermission = await prisma.clientPermission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ClientPermissions and only return the `id`
     * const clientPermissionWithIdOnly = await prisma.clientPermission.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClientPermissionCreateManyAndReturnArgs>(args?: SelectSubset<T, ClientPermissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ClientPermission.
     * @param {ClientPermissionDeleteArgs} args - Arguments to delete one ClientPermission.
     * @example
     * // Delete one ClientPermission
     * const ClientPermission = await prisma.clientPermission.delete({
     *   where: {
     *     // ... filter to delete one ClientPermission
     *   }
     * })
     * 
     */
    delete<T extends ClientPermissionDeleteArgs>(args: SelectSubset<T, ClientPermissionDeleteArgs<ExtArgs>>): Prisma__ClientPermissionClient<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ClientPermission.
     * @param {ClientPermissionUpdateArgs} args - Arguments to update one ClientPermission.
     * @example
     * // Update one ClientPermission
     * const clientPermission = await prisma.clientPermission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClientPermissionUpdateArgs>(args: SelectSubset<T, ClientPermissionUpdateArgs<ExtArgs>>): Prisma__ClientPermissionClient<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ClientPermissions.
     * @param {ClientPermissionDeleteManyArgs} args - Arguments to filter ClientPermissions to delete.
     * @example
     * // Delete a few ClientPermissions
     * const { count } = await prisma.clientPermission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClientPermissionDeleteManyArgs>(args?: SelectSubset<T, ClientPermissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClientPermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientPermissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ClientPermissions
     * const clientPermission = await prisma.clientPermission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClientPermissionUpdateManyArgs>(args: SelectSubset<T, ClientPermissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClientPermissions and returns the data updated in the database.
     * @param {ClientPermissionUpdateManyAndReturnArgs} args - Arguments to update many ClientPermissions.
     * @example
     * // Update many ClientPermissions
     * const clientPermission = await prisma.clientPermission.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ClientPermissions and only return the `id`
     * const clientPermissionWithIdOnly = await prisma.clientPermission.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClientPermissionUpdateManyAndReturnArgs>(args: SelectSubset<T, ClientPermissionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ClientPermission.
     * @param {ClientPermissionUpsertArgs} args - Arguments to update or create a ClientPermission.
     * @example
     * // Update or create a ClientPermission
     * const clientPermission = await prisma.clientPermission.upsert({
     *   create: {
     *     // ... data to create a ClientPermission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ClientPermission we want to update
     *   }
     * })
     */
    upsert<T extends ClientPermissionUpsertArgs>(args: SelectSubset<T, ClientPermissionUpsertArgs<ExtArgs>>): Prisma__ClientPermissionClient<$Result.GetResult<Prisma.$ClientPermissionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ClientPermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientPermissionCountArgs} args - Arguments to filter ClientPermissions to count.
     * @example
     * // Count the number of ClientPermissions
     * const count = await prisma.clientPermission.count({
     *   where: {
     *     // ... the filter for the ClientPermissions we want to count
     *   }
     * })
    **/
    count<T extends ClientPermissionCountArgs>(
      args?: Subset<T, ClientPermissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClientPermissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ClientPermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientPermissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClientPermissionAggregateArgs>(args: Subset<T, ClientPermissionAggregateArgs>): Prisma.PrismaPromise<GetClientPermissionAggregateType<T>>

    /**
     * Group by ClientPermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientPermissionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClientPermissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClientPermissionGroupByArgs['orderBy'] }
        : { orderBy?: ClientPermissionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClientPermissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientPermissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ClientPermission model
   */
  readonly fields: ClientPermissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ClientPermission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClientPermissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    client<T extends ClientAppDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClientAppDefaultArgs<ExtArgs>>): Prisma__ClientAppClient<$Result.GetResult<Prisma.$ClientAppPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    route<T extends ServiceRouteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ServiceRouteDefaultArgs<ExtArgs>>): Prisma__ServiceRouteClient<$Result.GetResult<Prisma.$ServiceRoutePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ClientPermission model
   */
  interface ClientPermissionFieldRefs {
    readonly id: FieldRef<"ClientPermission", 'String'>
    readonly clientId: FieldRef<"ClientPermission", 'String'>
    readonly routeId: FieldRef<"ClientPermission", 'String'>
    readonly scope: FieldRef<"ClientPermission", 'PermissionScope'>
  }
    

  // Custom InputTypes
  /**
   * ClientPermission findUnique
   */
  export type ClientPermissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    /**
     * Filter, which ClientPermission to fetch.
     */
    where: ClientPermissionWhereUniqueInput
  }

  /**
   * ClientPermission findUniqueOrThrow
   */
  export type ClientPermissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    /**
     * Filter, which ClientPermission to fetch.
     */
    where: ClientPermissionWhereUniqueInput
  }

  /**
   * ClientPermission findFirst
   */
  export type ClientPermissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    /**
     * Filter, which ClientPermission to fetch.
     */
    where?: ClientPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientPermissions to fetch.
     */
    orderBy?: ClientPermissionOrderByWithRelationInput | ClientPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClientPermissions.
     */
    cursor?: ClientPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClientPermissions.
     */
    distinct?: ClientPermissionScalarFieldEnum | ClientPermissionScalarFieldEnum[]
  }

  /**
   * ClientPermission findFirstOrThrow
   */
  export type ClientPermissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    /**
     * Filter, which ClientPermission to fetch.
     */
    where?: ClientPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientPermissions to fetch.
     */
    orderBy?: ClientPermissionOrderByWithRelationInput | ClientPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClientPermissions.
     */
    cursor?: ClientPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClientPermissions.
     */
    distinct?: ClientPermissionScalarFieldEnum | ClientPermissionScalarFieldEnum[]
  }

  /**
   * ClientPermission findMany
   */
  export type ClientPermissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    /**
     * Filter, which ClientPermissions to fetch.
     */
    where?: ClientPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientPermissions to fetch.
     */
    orderBy?: ClientPermissionOrderByWithRelationInput | ClientPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ClientPermissions.
     */
    cursor?: ClientPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientPermissions.
     */
    skip?: number
    distinct?: ClientPermissionScalarFieldEnum | ClientPermissionScalarFieldEnum[]
  }

  /**
   * ClientPermission create
   */
  export type ClientPermissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    /**
     * The data needed to create a ClientPermission.
     */
    data: XOR<ClientPermissionCreateInput, ClientPermissionUncheckedCreateInput>
  }

  /**
   * ClientPermission createMany
   */
  export type ClientPermissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ClientPermissions.
     */
    data: ClientPermissionCreateManyInput | ClientPermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ClientPermission createManyAndReturn
   */
  export type ClientPermissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * The data used to create many ClientPermissions.
     */
    data: ClientPermissionCreateManyInput | ClientPermissionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClientPermission update
   */
  export type ClientPermissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    /**
     * The data needed to update a ClientPermission.
     */
    data: XOR<ClientPermissionUpdateInput, ClientPermissionUncheckedUpdateInput>
    /**
     * Choose, which ClientPermission to update.
     */
    where: ClientPermissionWhereUniqueInput
  }

  /**
   * ClientPermission updateMany
   */
  export type ClientPermissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ClientPermissions.
     */
    data: XOR<ClientPermissionUpdateManyMutationInput, ClientPermissionUncheckedUpdateManyInput>
    /**
     * Filter which ClientPermissions to update
     */
    where?: ClientPermissionWhereInput
    /**
     * Limit how many ClientPermissions to update.
     */
    limit?: number
  }

  /**
   * ClientPermission updateManyAndReturn
   */
  export type ClientPermissionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * The data used to update ClientPermissions.
     */
    data: XOR<ClientPermissionUpdateManyMutationInput, ClientPermissionUncheckedUpdateManyInput>
    /**
     * Filter which ClientPermissions to update
     */
    where?: ClientPermissionWhereInput
    /**
     * Limit how many ClientPermissions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClientPermission upsert
   */
  export type ClientPermissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    /**
     * The filter to search for the ClientPermission to update in case it exists.
     */
    where: ClientPermissionWhereUniqueInput
    /**
     * In case the ClientPermission found by the `where` argument doesn't exist, create a new ClientPermission with this data.
     */
    create: XOR<ClientPermissionCreateInput, ClientPermissionUncheckedCreateInput>
    /**
     * In case the ClientPermission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClientPermissionUpdateInput, ClientPermissionUncheckedUpdateInput>
  }

  /**
   * ClientPermission delete
   */
  export type ClientPermissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
    /**
     * Filter which ClientPermission to delete.
     */
    where: ClientPermissionWhereUniqueInput
  }

  /**
   * ClientPermission deleteMany
   */
  export type ClientPermissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClientPermissions to delete
     */
    where?: ClientPermissionWhereInput
    /**
     * Limit how many ClientPermissions to delete.
     */
    limit?: number
  }

  /**
   * ClientPermission without action
   */
  export type ClientPermissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientPermission
     */
    select?: ClientPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientPermission
     */
    omit?: ClientPermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientPermissionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ServiceScalarFieldEnum: {
    id: 'id',
    name: 'name',
    baseUrl: 'baseUrl',
    createdAt: 'createdAt'
  };

  export type ServiceScalarFieldEnum = (typeof ServiceScalarFieldEnum)[keyof typeof ServiceScalarFieldEnum]


  export const ServiceRouteScalarFieldEnum: {
    id: 'id',
    serviceId: 'serviceId',
    name: 'name',
    method: 'method',
    actualPath: 'actualPath',
    exposedPath: 'exposedPath',
    createdAt: 'createdAt'
  };

  export type ServiceRouteScalarFieldEnum = (typeof ServiceRouteScalarFieldEnum)[keyof typeof ServiceRouteScalarFieldEnum]


  export const ClientAppScalarFieldEnum: {
    id: 'id',
    name: 'name',
    secret: 'secret',
    createdAt: 'createdAt'
  };

  export type ClientAppScalarFieldEnum = (typeof ClientAppScalarFieldEnum)[keyof typeof ClientAppScalarFieldEnum]


  export const ClientPermissionScalarFieldEnum: {
    id: 'id',
    clientId: 'clientId',
    routeId: 'routeId',
    scope: 'scope'
  };

  export type ClientPermissionScalarFieldEnum = (typeof ClientPermissionScalarFieldEnum)[keyof typeof ClientPermissionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'HttpMethod'
   */
  export type EnumHttpMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HttpMethod'>
    


  /**
   * Reference to a field of type 'HttpMethod[]'
   */
  export type ListEnumHttpMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HttpMethod[]'>
    


  /**
   * Reference to a field of type 'PermissionScope'
   */
  export type EnumPermissionScopeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionScope'>
    


  /**
   * Reference to a field of type 'PermissionScope[]'
   */
  export type ListEnumPermissionScopeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionScope[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type ServiceWhereInput = {
    AND?: ServiceWhereInput | ServiceWhereInput[]
    OR?: ServiceWhereInput[]
    NOT?: ServiceWhereInput | ServiceWhereInput[]
    id?: StringFilter<"Service"> | string
    name?: StringFilter<"Service"> | string
    baseUrl?: StringFilter<"Service"> | string
    createdAt?: DateTimeFilter<"Service"> | Date | string
    routes?: ServiceRouteListRelationFilter
  }

  export type ServiceOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    baseUrl?: SortOrder
    createdAt?: SortOrder
    routes?: ServiceRouteOrderByRelationAggregateInput
  }

  export type ServiceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: ServiceWhereInput | ServiceWhereInput[]
    OR?: ServiceWhereInput[]
    NOT?: ServiceWhereInput | ServiceWhereInput[]
    baseUrl?: StringFilter<"Service"> | string
    createdAt?: DateTimeFilter<"Service"> | Date | string
    routes?: ServiceRouteListRelationFilter
  }, "id" | "name">

  export type ServiceOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    baseUrl?: SortOrder
    createdAt?: SortOrder
    _count?: ServiceCountOrderByAggregateInput
    _max?: ServiceMaxOrderByAggregateInput
    _min?: ServiceMinOrderByAggregateInput
  }

  export type ServiceScalarWhereWithAggregatesInput = {
    AND?: ServiceScalarWhereWithAggregatesInput | ServiceScalarWhereWithAggregatesInput[]
    OR?: ServiceScalarWhereWithAggregatesInput[]
    NOT?: ServiceScalarWhereWithAggregatesInput | ServiceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Service"> | string
    name?: StringWithAggregatesFilter<"Service"> | string
    baseUrl?: StringWithAggregatesFilter<"Service"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Service"> | Date | string
  }

  export type ServiceRouteWhereInput = {
    AND?: ServiceRouteWhereInput | ServiceRouteWhereInput[]
    OR?: ServiceRouteWhereInput[]
    NOT?: ServiceRouteWhereInput | ServiceRouteWhereInput[]
    id?: StringFilter<"ServiceRoute"> | string
    serviceId?: StringFilter<"ServiceRoute"> | string
    name?: StringFilter<"ServiceRoute"> | string
    method?: EnumHttpMethodFilter<"ServiceRoute"> | $Enums.HttpMethod
    actualPath?: StringFilter<"ServiceRoute"> | string
    exposedPath?: StringFilter<"ServiceRoute"> | string
    createdAt?: DateTimeFilter<"ServiceRoute"> | Date | string
    service?: XOR<ServiceScalarRelationFilter, ServiceWhereInput>
    permissions?: ClientPermissionListRelationFilter
  }

  export type ServiceRouteOrderByWithRelationInput = {
    id?: SortOrder
    serviceId?: SortOrder
    name?: SortOrder
    method?: SortOrder
    actualPath?: SortOrder
    exposedPath?: SortOrder
    createdAt?: SortOrder
    service?: ServiceOrderByWithRelationInput
    permissions?: ClientPermissionOrderByRelationAggregateInput
  }

  export type ServiceRouteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    serviceId_method_actualPath?: ServiceRouteServiceIdMethodActualPathCompoundUniqueInput
    method_exposedPath?: ServiceRouteMethodExposedPathCompoundUniqueInput
    AND?: ServiceRouteWhereInput | ServiceRouteWhereInput[]
    OR?: ServiceRouteWhereInput[]
    NOT?: ServiceRouteWhereInput | ServiceRouteWhereInput[]
    serviceId?: StringFilter<"ServiceRoute"> | string
    name?: StringFilter<"ServiceRoute"> | string
    method?: EnumHttpMethodFilter<"ServiceRoute"> | $Enums.HttpMethod
    actualPath?: StringFilter<"ServiceRoute"> | string
    exposedPath?: StringFilter<"ServiceRoute"> | string
    createdAt?: DateTimeFilter<"ServiceRoute"> | Date | string
    service?: XOR<ServiceScalarRelationFilter, ServiceWhereInput>
    permissions?: ClientPermissionListRelationFilter
  }, "id" | "serviceId_method_actualPath" | "method_exposedPath">

  export type ServiceRouteOrderByWithAggregationInput = {
    id?: SortOrder
    serviceId?: SortOrder
    name?: SortOrder
    method?: SortOrder
    actualPath?: SortOrder
    exposedPath?: SortOrder
    createdAt?: SortOrder
    _count?: ServiceRouteCountOrderByAggregateInput
    _max?: ServiceRouteMaxOrderByAggregateInput
    _min?: ServiceRouteMinOrderByAggregateInput
  }

  export type ServiceRouteScalarWhereWithAggregatesInput = {
    AND?: ServiceRouteScalarWhereWithAggregatesInput | ServiceRouteScalarWhereWithAggregatesInput[]
    OR?: ServiceRouteScalarWhereWithAggregatesInput[]
    NOT?: ServiceRouteScalarWhereWithAggregatesInput | ServiceRouteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ServiceRoute"> | string
    serviceId?: StringWithAggregatesFilter<"ServiceRoute"> | string
    name?: StringWithAggregatesFilter<"ServiceRoute"> | string
    method?: EnumHttpMethodWithAggregatesFilter<"ServiceRoute"> | $Enums.HttpMethod
    actualPath?: StringWithAggregatesFilter<"ServiceRoute"> | string
    exposedPath?: StringWithAggregatesFilter<"ServiceRoute"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ServiceRoute"> | Date | string
  }

  export type ClientAppWhereInput = {
    AND?: ClientAppWhereInput | ClientAppWhereInput[]
    OR?: ClientAppWhereInput[]
    NOT?: ClientAppWhereInput | ClientAppWhereInput[]
    id?: StringFilter<"ClientApp"> | string
    name?: StringFilter<"ClientApp"> | string
    secret?: StringFilter<"ClientApp"> | string
    createdAt?: DateTimeFilter<"ClientApp"> | Date | string
    permissions?: ClientPermissionListRelationFilter
  }

  export type ClientAppOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    secret?: SortOrder
    createdAt?: SortOrder
    permissions?: ClientPermissionOrderByRelationAggregateInput
  }

  export type ClientAppWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: ClientAppWhereInput | ClientAppWhereInput[]
    OR?: ClientAppWhereInput[]
    NOT?: ClientAppWhereInput | ClientAppWhereInput[]
    secret?: StringFilter<"ClientApp"> | string
    createdAt?: DateTimeFilter<"ClientApp"> | Date | string
    permissions?: ClientPermissionListRelationFilter
  }, "id" | "name">

  export type ClientAppOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    secret?: SortOrder
    createdAt?: SortOrder
    _count?: ClientAppCountOrderByAggregateInput
    _max?: ClientAppMaxOrderByAggregateInput
    _min?: ClientAppMinOrderByAggregateInput
  }

  export type ClientAppScalarWhereWithAggregatesInput = {
    AND?: ClientAppScalarWhereWithAggregatesInput | ClientAppScalarWhereWithAggregatesInput[]
    OR?: ClientAppScalarWhereWithAggregatesInput[]
    NOT?: ClientAppScalarWhereWithAggregatesInput | ClientAppScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ClientApp"> | string
    name?: StringWithAggregatesFilter<"ClientApp"> | string
    secret?: StringWithAggregatesFilter<"ClientApp"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ClientApp"> | Date | string
  }

  export type ClientPermissionWhereInput = {
    AND?: ClientPermissionWhereInput | ClientPermissionWhereInput[]
    OR?: ClientPermissionWhereInput[]
    NOT?: ClientPermissionWhereInput | ClientPermissionWhereInput[]
    id?: StringFilter<"ClientPermission"> | string
    clientId?: StringFilter<"ClientPermission"> | string
    routeId?: StringFilter<"ClientPermission"> | string
    scope?: EnumPermissionScopeFilter<"ClientPermission"> | $Enums.PermissionScope
    client?: XOR<ClientAppScalarRelationFilter, ClientAppWhereInput>
    route?: XOR<ServiceRouteScalarRelationFilter, ServiceRouteWhereInput>
  }

  export type ClientPermissionOrderByWithRelationInput = {
    id?: SortOrder
    clientId?: SortOrder
    routeId?: SortOrder
    scope?: SortOrder
    client?: ClientAppOrderByWithRelationInput
    route?: ServiceRouteOrderByWithRelationInput
  }

  export type ClientPermissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    clientId_routeId?: ClientPermissionClientIdRouteIdCompoundUniqueInput
    AND?: ClientPermissionWhereInput | ClientPermissionWhereInput[]
    OR?: ClientPermissionWhereInput[]
    NOT?: ClientPermissionWhereInput | ClientPermissionWhereInput[]
    clientId?: StringFilter<"ClientPermission"> | string
    routeId?: StringFilter<"ClientPermission"> | string
    scope?: EnumPermissionScopeFilter<"ClientPermission"> | $Enums.PermissionScope
    client?: XOR<ClientAppScalarRelationFilter, ClientAppWhereInput>
    route?: XOR<ServiceRouteScalarRelationFilter, ServiceRouteWhereInput>
  }, "id" | "clientId_routeId">

  export type ClientPermissionOrderByWithAggregationInput = {
    id?: SortOrder
    clientId?: SortOrder
    routeId?: SortOrder
    scope?: SortOrder
    _count?: ClientPermissionCountOrderByAggregateInput
    _max?: ClientPermissionMaxOrderByAggregateInput
    _min?: ClientPermissionMinOrderByAggregateInput
  }

  export type ClientPermissionScalarWhereWithAggregatesInput = {
    AND?: ClientPermissionScalarWhereWithAggregatesInput | ClientPermissionScalarWhereWithAggregatesInput[]
    OR?: ClientPermissionScalarWhereWithAggregatesInput[]
    NOT?: ClientPermissionScalarWhereWithAggregatesInput | ClientPermissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ClientPermission"> | string
    clientId?: StringWithAggregatesFilter<"ClientPermission"> | string
    routeId?: StringWithAggregatesFilter<"ClientPermission"> | string
    scope?: EnumPermissionScopeWithAggregatesFilter<"ClientPermission"> | $Enums.PermissionScope
  }

  export type ServiceCreateInput = {
    id?: string
    name: string
    baseUrl: string
    createdAt?: Date | string
    routes?: ServiceRouteCreateNestedManyWithoutServiceInput
  }

  export type ServiceUncheckedCreateInput = {
    id?: string
    name: string
    baseUrl: string
    createdAt?: Date | string
    routes?: ServiceRouteUncheckedCreateNestedManyWithoutServiceInput
  }

  export type ServiceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routes?: ServiceRouteUpdateManyWithoutServiceNestedInput
  }

  export type ServiceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routes?: ServiceRouteUncheckedUpdateManyWithoutServiceNestedInput
  }

  export type ServiceCreateManyInput = {
    id?: string
    name: string
    baseUrl: string
    createdAt?: Date | string
  }

  export type ServiceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceRouteCreateInput = {
    id?: string
    name: string
    method: $Enums.HttpMethod
    actualPath: string
    exposedPath: string
    createdAt?: Date | string
    service: ServiceCreateNestedOneWithoutRoutesInput
    permissions?: ClientPermissionCreateNestedManyWithoutRouteInput
  }

  export type ServiceRouteUncheckedCreateInput = {
    id?: string
    serviceId: string
    name: string
    method: $Enums.HttpMethod
    actualPath: string
    exposedPath: string
    createdAt?: Date | string
    permissions?: ClientPermissionUncheckedCreateNestedManyWithoutRouteInput
  }

  export type ServiceRouteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    actualPath?: StringFieldUpdateOperationsInput | string
    exposedPath?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    service?: ServiceUpdateOneRequiredWithoutRoutesNestedInput
    permissions?: ClientPermissionUpdateManyWithoutRouteNestedInput
  }

  export type ServiceRouteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    actualPath?: StringFieldUpdateOperationsInput | string
    exposedPath?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: ClientPermissionUncheckedUpdateManyWithoutRouteNestedInput
  }

  export type ServiceRouteCreateManyInput = {
    id?: string
    serviceId: string
    name: string
    method: $Enums.HttpMethod
    actualPath: string
    exposedPath: string
    createdAt?: Date | string
  }

  export type ServiceRouteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    actualPath?: StringFieldUpdateOperationsInput | string
    exposedPath?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceRouteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    actualPath?: StringFieldUpdateOperationsInput | string
    exposedPath?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientAppCreateInput = {
    id?: string
    name: string
    secret: string
    createdAt?: Date | string
    permissions?: ClientPermissionCreateNestedManyWithoutClientInput
  }

  export type ClientAppUncheckedCreateInput = {
    id?: string
    name: string
    secret: string
    createdAt?: Date | string
    permissions?: ClientPermissionUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientAppUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    secret?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: ClientPermissionUpdateManyWithoutClientNestedInput
  }

  export type ClientAppUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    secret?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: ClientPermissionUncheckedUpdateManyWithoutClientNestedInput
  }

  export type ClientAppCreateManyInput = {
    id?: string
    name: string
    secret: string
    createdAt?: Date | string
  }

  export type ClientAppUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    secret?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientAppUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    secret?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientPermissionCreateInput = {
    id?: string
    scope?: $Enums.PermissionScope
    client: ClientAppCreateNestedOneWithoutPermissionsInput
    route: ServiceRouteCreateNestedOneWithoutPermissionsInput
  }

  export type ClientPermissionUncheckedCreateInput = {
    id?: string
    clientId: string
    routeId: string
    scope?: $Enums.PermissionScope
  }

  export type ClientPermissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
    client?: ClientAppUpdateOneRequiredWithoutPermissionsNestedInput
    route?: ServiceRouteUpdateOneRequiredWithoutPermissionsNestedInput
  }

  export type ClientPermissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    routeId?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
  }

  export type ClientPermissionCreateManyInput = {
    id?: string
    clientId: string
    routeId: string
    scope?: $Enums.PermissionScope
  }

  export type ClientPermissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
  }

  export type ClientPermissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    routeId?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ServiceRouteListRelationFilter = {
    every?: ServiceRouteWhereInput
    some?: ServiceRouteWhereInput
    none?: ServiceRouteWhereInput
  }

  export type ServiceRouteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ServiceCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    baseUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type ServiceMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    baseUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type ServiceMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    baseUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumHttpMethodFilter<$PrismaModel = never> = {
    equals?: $Enums.HttpMethod | EnumHttpMethodFieldRefInput<$PrismaModel>
    in?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumHttpMethodFilter<$PrismaModel> | $Enums.HttpMethod
  }

  export type ServiceScalarRelationFilter = {
    is?: ServiceWhereInput
    isNot?: ServiceWhereInput
  }

  export type ClientPermissionListRelationFilter = {
    every?: ClientPermissionWhereInput
    some?: ClientPermissionWhereInput
    none?: ClientPermissionWhereInput
  }

  export type ClientPermissionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ServiceRouteServiceIdMethodActualPathCompoundUniqueInput = {
    serviceId: string
    method: $Enums.HttpMethod
    actualPath: string
  }

  export type ServiceRouteMethodExposedPathCompoundUniqueInput = {
    method: $Enums.HttpMethod
    exposedPath: string
  }

  export type ServiceRouteCountOrderByAggregateInput = {
    id?: SortOrder
    serviceId?: SortOrder
    name?: SortOrder
    method?: SortOrder
    actualPath?: SortOrder
    exposedPath?: SortOrder
    createdAt?: SortOrder
  }

  export type ServiceRouteMaxOrderByAggregateInput = {
    id?: SortOrder
    serviceId?: SortOrder
    name?: SortOrder
    method?: SortOrder
    actualPath?: SortOrder
    exposedPath?: SortOrder
    createdAt?: SortOrder
  }

  export type ServiceRouteMinOrderByAggregateInput = {
    id?: SortOrder
    serviceId?: SortOrder
    name?: SortOrder
    method?: SortOrder
    actualPath?: SortOrder
    exposedPath?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumHttpMethodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HttpMethod | EnumHttpMethodFieldRefInput<$PrismaModel>
    in?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumHttpMethodWithAggregatesFilter<$PrismaModel> | $Enums.HttpMethod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumHttpMethodFilter<$PrismaModel>
    _max?: NestedEnumHttpMethodFilter<$PrismaModel>
  }

  export type ClientAppCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    secret?: SortOrder
    createdAt?: SortOrder
  }

  export type ClientAppMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    secret?: SortOrder
    createdAt?: SortOrder
  }

  export type ClientAppMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    secret?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumPermissionScopeFilter<$PrismaModel = never> = {
    equals?: $Enums.PermissionScope | EnumPermissionScopeFieldRefInput<$PrismaModel>
    in?: $Enums.PermissionScope[] | ListEnumPermissionScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PermissionScope[] | ListEnumPermissionScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumPermissionScopeFilter<$PrismaModel> | $Enums.PermissionScope
  }

  export type ClientAppScalarRelationFilter = {
    is?: ClientAppWhereInput
    isNot?: ClientAppWhereInput
  }

  export type ServiceRouteScalarRelationFilter = {
    is?: ServiceRouteWhereInput
    isNot?: ServiceRouteWhereInput
  }

  export type ClientPermissionClientIdRouteIdCompoundUniqueInput = {
    clientId: string
    routeId: string
  }

  export type ClientPermissionCountOrderByAggregateInput = {
    id?: SortOrder
    clientId?: SortOrder
    routeId?: SortOrder
    scope?: SortOrder
  }

  export type ClientPermissionMaxOrderByAggregateInput = {
    id?: SortOrder
    clientId?: SortOrder
    routeId?: SortOrder
    scope?: SortOrder
  }

  export type ClientPermissionMinOrderByAggregateInput = {
    id?: SortOrder
    clientId?: SortOrder
    routeId?: SortOrder
    scope?: SortOrder
  }

  export type EnumPermissionScopeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PermissionScope | EnumPermissionScopeFieldRefInput<$PrismaModel>
    in?: $Enums.PermissionScope[] | ListEnumPermissionScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PermissionScope[] | ListEnumPermissionScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumPermissionScopeWithAggregatesFilter<$PrismaModel> | $Enums.PermissionScope
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPermissionScopeFilter<$PrismaModel>
    _max?: NestedEnumPermissionScopeFilter<$PrismaModel>
  }

  export type ServiceRouteCreateNestedManyWithoutServiceInput = {
    create?: XOR<ServiceRouteCreateWithoutServiceInput, ServiceRouteUncheckedCreateWithoutServiceInput> | ServiceRouteCreateWithoutServiceInput[] | ServiceRouteUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: ServiceRouteCreateOrConnectWithoutServiceInput | ServiceRouteCreateOrConnectWithoutServiceInput[]
    createMany?: ServiceRouteCreateManyServiceInputEnvelope
    connect?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
  }

  export type ServiceRouteUncheckedCreateNestedManyWithoutServiceInput = {
    create?: XOR<ServiceRouteCreateWithoutServiceInput, ServiceRouteUncheckedCreateWithoutServiceInput> | ServiceRouteCreateWithoutServiceInput[] | ServiceRouteUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: ServiceRouteCreateOrConnectWithoutServiceInput | ServiceRouteCreateOrConnectWithoutServiceInput[]
    createMany?: ServiceRouteCreateManyServiceInputEnvelope
    connect?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ServiceRouteUpdateManyWithoutServiceNestedInput = {
    create?: XOR<ServiceRouteCreateWithoutServiceInput, ServiceRouteUncheckedCreateWithoutServiceInput> | ServiceRouteCreateWithoutServiceInput[] | ServiceRouteUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: ServiceRouteCreateOrConnectWithoutServiceInput | ServiceRouteCreateOrConnectWithoutServiceInput[]
    upsert?: ServiceRouteUpsertWithWhereUniqueWithoutServiceInput | ServiceRouteUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: ServiceRouteCreateManyServiceInputEnvelope
    set?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
    disconnect?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
    delete?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
    connect?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
    update?: ServiceRouteUpdateWithWhereUniqueWithoutServiceInput | ServiceRouteUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: ServiceRouteUpdateManyWithWhereWithoutServiceInput | ServiceRouteUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: ServiceRouteScalarWhereInput | ServiceRouteScalarWhereInput[]
  }

  export type ServiceRouteUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: XOR<ServiceRouteCreateWithoutServiceInput, ServiceRouteUncheckedCreateWithoutServiceInput> | ServiceRouteCreateWithoutServiceInput[] | ServiceRouteUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: ServiceRouteCreateOrConnectWithoutServiceInput | ServiceRouteCreateOrConnectWithoutServiceInput[]
    upsert?: ServiceRouteUpsertWithWhereUniqueWithoutServiceInput | ServiceRouteUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: ServiceRouteCreateManyServiceInputEnvelope
    set?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
    disconnect?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
    delete?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
    connect?: ServiceRouteWhereUniqueInput | ServiceRouteWhereUniqueInput[]
    update?: ServiceRouteUpdateWithWhereUniqueWithoutServiceInput | ServiceRouteUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: ServiceRouteUpdateManyWithWhereWithoutServiceInput | ServiceRouteUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: ServiceRouteScalarWhereInput | ServiceRouteScalarWhereInput[]
  }

  export type ServiceCreateNestedOneWithoutRoutesInput = {
    create?: XOR<ServiceCreateWithoutRoutesInput, ServiceUncheckedCreateWithoutRoutesInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutRoutesInput
    connect?: ServiceWhereUniqueInput
  }

  export type ClientPermissionCreateNestedManyWithoutRouteInput = {
    create?: XOR<ClientPermissionCreateWithoutRouteInput, ClientPermissionUncheckedCreateWithoutRouteInput> | ClientPermissionCreateWithoutRouteInput[] | ClientPermissionUncheckedCreateWithoutRouteInput[]
    connectOrCreate?: ClientPermissionCreateOrConnectWithoutRouteInput | ClientPermissionCreateOrConnectWithoutRouteInput[]
    createMany?: ClientPermissionCreateManyRouteInputEnvelope
    connect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
  }

  export type ClientPermissionUncheckedCreateNestedManyWithoutRouteInput = {
    create?: XOR<ClientPermissionCreateWithoutRouteInput, ClientPermissionUncheckedCreateWithoutRouteInput> | ClientPermissionCreateWithoutRouteInput[] | ClientPermissionUncheckedCreateWithoutRouteInput[]
    connectOrCreate?: ClientPermissionCreateOrConnectWithoutRouteInput | ClientPermissionCreateOrConnectWithoutRouteInput[]
    createMany?: ClientPermissionCreateManyRouteInputEnvelope
    connect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
  }

  export type EnumHttpMethodFieldUpdateOperationsInput = {
    set?: $Enums.HttpMethod
  }

  export type ServiceUpdateOneRequiredWithoutRoutesNestedInput = {
    create?: XOR<ServiceCreateWithoutRoutesInput, ServiceUncheckedCreateWithoutRoutesInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutRoutesInput
    upsert?: ServiceUpsertWithoutRoutesInput
    connect?: ServiceWhereUniqueInput
    update?: XOR<XOR<ServiceUpdateToOneWithWhereWithoutRoutesInput, ServiceUpdateWithoutRoutesInput>, ServiceUncheckedUpdateWithoutRoutesInput>
  }

  export type ClientPermissionUpdateManyWithoutRouteNestedInput = {
    create?: XOR<ClientPermissionCreateWithoutRouteInput, ClientPermissionUncheckedCreateWithoutRouteInput> | ClientPermissionCreateWithoutRouteInput[] | ClientPermissionUncheckedCreateWithoutRouteInput[]
    connectOrCreate?: ClientPermissionCreateOrConnectWithoutRouteInput | ClientPermissionCreateOrConnectWithoutRouteInput[]
    upsert?: ClientPermissionUpsertWithWhereUniqueWithoutRouteInput | ClientPermissionUpsertWithWhereUniqueWithoutRouteInput[]
    createMany?: ClientPermissionCreateManyRouteInputEnvelope
    set?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    disconnect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    delete?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    connect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    update?: ClientPermissionUpdateWithWhereUniqueWithoutRouteInput | ClientPermissionUpdateWithWhereUniqueWithoutRouteInput[]
    updateMany?: ClientPermissionUpdateManyWithWhereWithoutRouteInput | ClientPermissionUpdateManyWithWhereWithoutRouteInput[]
    deleteMany?: ClientPermissionScalarWhereInput | ClientPermissionScalarWhereInput[]
  }

  export type ClientPermissionUncheckedUpdateManyWithoutRouteNestedInput = {
    create?: XOR<ClientPermissionCreateWithoutRouteInput, ClientPermissionUncheckedCreateWithoutRouteInput> | ClientPermissionCreateWithoutRouteInput[] | ClientPermissionUncheckedCreateWithoutRouteInput[]
    connectOrCreate?: ClientPermissionCreateOrConnectWithoutRouteInput | ClientPermissionCreateOrConnectWithoutRouteInput[]
    upsert?: ClientPermissionUpsertWithWhereUniqueWithoutRouteInput | ClientPermissionUpsertWithWhereUniqueWithoutRouteInput[]
    createMany?: ClientPermissionCreateManyRouteInputEnvelope
    set?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    disconnect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    delete?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    connect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    update?: ClientPermissionUpdateWithWhereUniqueWithoutRouteInput | ClientPermissionUpdateWithWhereUniqueWithoutRouteInput[]
    updateMany?: ClientPermissionUpdateManyWithWhereWithoutRouteInput | ClientPermissionUpdateManyWithWhereWithoutRouteInput[]
    deleteMany?: ClientPermissionScalarWhereInput | ClientPermissionScalarWhereInput[]
  }

  export type ClientPermissionCreateNestedManyWithoutClientInput = {
    create?: XOR<ClientPermissionCreateWithoutClientInput, ClientPermissionUncheckedCreateWithoutClientInput> | ClientPermissionCreateWithoutClientInput[] | ClientPermissionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: ClientPermissionCreateOrConnectWithoutClientInput | ClientPermissionCreateOrConnectWithoutClientInput[]
    createMany?: ClientPermissionCreateManyClientInputEnvelope
    connect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
  }

  export type ClientPermissionUncheckedCreateNestedManyWithoutClientInput = {
    create?: XOR<ClientPermissionCreateWithoutClientInput, ClientPermissionUncheckedCreateWithoutClientInput> | ClientPermissionCreateWithoutClientInput[] | ClientPermissionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: ClientPermissionCreateOrConnectWithoutClientInput | ClientPermissionCreateOrConnectWithoutClientInput[]
    createMany?: ClientPermissionCreateManyClientInputEnvelope
    connect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
  }

  export type ClientPermissionUpdateManyWithoutClientNestedInput = {
    create?: XOR<ClientPermissionCreateWithoutClientInput, ClientPermissionUncheckedCreateWithoutClientInput> | ClientPermissionCreateWithoutClientInput[] | ClientPermissionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: ClientPermissionCreateOrConnectWithoutClientInput | ClientPermissionCreateOrConnectWithoutClientInput[]
    upsert?: ClientPermissionUpsertWithWhereUniqueWithoutClientInput | ClientPermissionUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: ClientPermissionCreateManyClientInputEnvelope
    set?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    disconnect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    delete?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    connect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    update?: ClientPermissionUpdateWithWhereUniqueWithoutClientInput | ClientPermissionUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: ClientPermissionUpdateManyWithWhereWithoutClientInput | ClientPermissionUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: ClientPermissionScalarWhereInput | ClientPermissionScalarWhereInput[]
  }

  export type ClientPermissionUncheckedUpdateManyWithoutClientNestedInput = {
    create?: XOR<ClientPermissionCreateWithoutClientInput, ClientPermissionUncheckedCreateWithoutClientInput> | ClientPermissionCreateWithoutClientInput[] | ClientPermissionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: ClientPermissionCreateOrConnectWithoutClientInput | ClientPermissionCreateOrConnectWithoutClientInput[]
    upsert?: ClientPermissionUpsertWithWhereUniqueWithoutClientInput | ClientPermissionUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: ClientPermissionCreateManyClientInputEnvelope
    set?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    disconnect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    delete?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    connect?: ClientPermissionWhereUniqueInput | ClientPermissionWhereUniqueInput[]
    update?: ClientPermissionUpdateWithWhereUniqueWithoutClientInput | ClientPermissionUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: ClientPermissionUpdateManyWithWhereWithoutClientInput | ClientPermissionUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: ClientPermissionScalarWhereInput | ClientPermissionScalarWhereInput[]
  }

  export type ClientAppCreateNestedOneWithoutPermissionsInput = {
    create?: XOR<ClientAppCreateWithoutPermissionsInput, ClientAppUncheckedCreateWithoutPermissionsInput>
    connectOrCreate?: ClientAppCreateOrConnectWithoutPermissionsInput
    connect?: ClientAppWhereUniqueInput
  }

  export type ServiceRouteCreateNestedOneWithoutPermissionsInput = {
    create?: XOR<ServiceRouteCreateWithoutPermissionsInput, ServiceRouteUncheckedCreateWithoutPermissionsInput>
    connectOrCreate?: ServiceRouteCreateOrConnectWithoutPermissionsInput
    connect?: ServiceRouteWhereUniqueInput
  }

  export type EnumPermissionScopeFieldUpdateOperationsInput = {
    set?: $Enums.PermissionScope
  }

  export type ClientAppUpdateOneRequiredWithoutPermissionsNestedInput = {
    create?: XOR<ClientAppCreateWithoutPermissionsInput, ClientAppUncheckedCreateWithoutPermissionsInput>
    connectOrCreate?: ClientAppCreateOrConnectWithoutPermissionsInput
    upsert?: ClientAppUpsertWithoutPermissionsInput
    connect?: ClientAppWhereUniqueInput
    update?: XOR<XOR<ClientAppUpdateToOneWithWhereWithoutPermissionsInput, ClientAppUpdateWithoutPermissionsInput>, ClientAppUncheckedUpdateWithoutPermissionsInput>
  }

  export type ServiceRouteUpdateOneRequiredWithoutPermissionsNestedInput = {
    create?: XOR<ServiceRouteCreateWithoutPermissionsInput, ServiceRouteUncheckedCreateWithoutPermissionsInput>
    connectOrCreate?: ServiceRouteCreateOrConnectWithoutPermissionsInput
    upsert?: ServiceRouteUpsertWithoutPermissionsInput
    connect?: ServiceRouteWhereUniqueInput
    update?: XOR<XOR<ServiceRouteUpdateToOneWithWhereWithoutPermissionsInput, ServiceRouteUpdateWithoutPermissionsInput>, ServiceRouteUncheckedUpdateWithoutPermissionsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumHttpMethodFilter<$PrismaModel = never> = {
    equals?: $Enums.HttpMethod | EnumHttpMethodFieldRefInput<$PrismaModel>
    in?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumHttpMethodFilter<$PrismaModel> | $Enums.HttpMethod
  }

  export type NestedEnumHttpMethodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HttpMethod | EnumHttpMethodFieldRefInput<$PrismaModel>
    in?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.HttpMethod[] | ListEnumHttpMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumHttpMethodWithAggregatesFilter<$PrismaModel> | $Enums.HttpMethod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumHttpMethodFilter<$PrismaModel>
    _max?: NestedEnumHttpMethodFilter<$PrismaModel>
  }

  export type NestedEnumPermissionScopeFilter<$PrismaModel = never> = {
    equals?: $Enums.PermissionScope | EnumPermissionScopeFieldRefInput<$PrismaModel>
    in?: $Enums.PermissionScope[] | ListEnumPermissionScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PermissionScope[] | ListEnumPermissionScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumPermissionScopeFilter<$PrismaModel> | $Enums.PermissionScope
  }

  export type NestedEnumPermissionScopeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PermissionScope | EnumPermissionScopeFieldRefInput<$PrismaModel>
    in?: $Enums.PermissionScope[] | ListEnumPermissionScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PermissionScope[] | ListEnumPermissionScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumPermissionScopeWithAggregatesFilter<$PrismaModel> | $Enums.PermissionScope
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPermissionScopeFilter<$PrismaModel>
    _max?: NestedEnumPermissionScopeFilter<$PrismaModel>
  }

  export type ServiceRouteCreateWithoutServiceInput = {
    id?: string
    name: string
    method: $Enums.HttpMethod
    actualPath: string
    exposedPath: string
    createdAt?: Date | string
    permissions?: ClientPermissionCreateNestedManyWithoutRouteInput
  }

  export type ServiceRouteUncheckedCreateWithoutServiceInput = {
    id?: string
    name: string
    method: $Enums.HttpMethod
    actualPath: string
    exposedPath: string
    createdAt?: Date | string
    permissions?: ClientPermissionUncheckedCreateNestedManyWithoutRouteInput
  }

  export type ServiceRouteCreateOrConnectWithoutServiceInput = {
    where: ServiceRouteWhereUniqueInput
    create: XOR<ServiceRouteCreateWithoutServiceInput, ServiceRouteUncheckedCreateWithoutServiceInput>
  }

  export type ServiceRouteCreateManyServiceInputEnvelope = {
    data: ServiceRouteCreateManyServiceInput | ServiceRouteCreateManyServiceInput[]
    skipDuplicates?: boolean
  }

  export type ServiceRouteUpsertWithWhereUniqueWithoutServiceInput = {
    where: ServiceRouteWhereUniqueInput
    update: XOR<ServiceRouteUpdateWithoutServiceInput, ServiceRouteUncheckedUpdateWithoutServiceInput>
    create: XOR<ServiceRouteCreateWithoutServiceInput, ServiceRouteUncheckedCreateWithoutServiceInput>
  }

  export type ServiceRouteUpdateWithWhereUniqueWithoutServiceInput = {
    where: ServiceRouteWhereUniqueInput
    data: XOR<ServiceRouteUpdateWithoutServiceInput, ServiceRouteUncheckedUpdateWithoutServiceInput>
  }

  export type ServiceRouteUpdateManyWithWhereWithoutServiceInput = {
    where: ServiceRouteScalarWhereInput
    data: XOR<ServiceRouteUpdateManyMutationInput, ServiceRouteUncheckedUpdateManyWithoutServiceInput>
  }

  export type ServiceRouteScalarWhereInput = {
    AND?: ServiceRouteScalarWhereInput | ServiceRouteScalarWhereInput[]
    OR?: ServiceRouteScalarWhereInput[]
    NOT?: ServiceRouteScalarWhereInput | ServiceRouteScalarWhereInput[]
    id?: StringFilter<"ServiceRoute"> | string
    serviceId?: StringFilter<"ServiceRoute"> | string
    name?: StringFilter<"ServiceRoute"> | string
    method?: EnumHttpMethodFilter<"ServiceRoute"> | $Enums.HttpMethod
    actualPath?: StringFilter<"ServiceRoute"> | string
    exposedPath?: StringFilter<"ServiceRoute"> | string
    createdAt?: DateTimeFilter<"ServiceRoute"> | Date | string
  }

  export type ServiceCreateWithoutRoutesInput = {
    id?: string
    name: string
    baseUrl: string
    createdAt?: Date | string
  }

  export type ServiceUncheckedCreateWithoutRoutesInput = {
    id?: string
    name: string
    baseUrl: string
    createdAt?: Date | string
  }

  export type ServiceCreateOrConnectWithoutRoutesInput = {
    where: ServiceWhereUniqueInput
    create: XOR<ServiceCreateWithoutRoutesInput, ServiceUncheckedCreateWithoutRoutesInput>
  }

  export type ClientPermissionCreateWithoutRouteInput = {
    id?: string
    scope?: $Enums.PermissionScope
    client: ClientAppCreateNestedOneWithoutPermissionsInput
  }

  export type ClientPermissionUncheckedCreateWithoutRouteInput = {
    id?: string
    clientId: string
    scope?: $Enums.PermissionScope
  }

  export type ClientPermissionCreateOrConnectWithoutRouteInput = {
    where: ClientPermissionWhereUniqueInput
    create: XOR<ClientPermissionCreateWithoutRouteInput, ClientPermissionUncheckedCreateWithoutRouteInput>
  }

  export type ClientPermissionCreateManyRouteInputEnvelope = {
    data: ClientPermissionCreateManyRouteInput | ClientPermissionCreateManyRouteInput[]
    skipDuplicates?: boolean
  }

  export type ServiceUpsertWithoutRoutesInput = {
    update: XOR<ServiceUpdateWithoutRoutesInput, ServiceUncheckedUpdateWithoutRoutesInput>
    create: XOR<ServiceCreateWithoutRoutesInput, ServiceUncheckedCreateWithoutRoutesInput>
    where?: ServiceWhereInput
  }

  export type ServiceUpdateToOneWithWhereWithoutRoutesInput = {
    where?: ServiceWhereInput
    data: XOR<ServiceUpdateWithoutRoutesInput, ServiceUncheckedUpdateWithoutRoutesInput>
  }

  export type ServiceUpdateWithoutRoutesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceUncheckedUpdateWithoutRoutesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientPermissionUpsertWithWhereUniqueWithoutRouteInput = {
    where: ClientPermissionWhereUniqueInput
    update: XOR<ClientPermissionUpdateWithoutRouteInput, ClientPermissionUncheckedUpdateWithoutRouteInput>
    create: XOR<ClientPermissionCreateWithoutRouteInput, ClientPermissionUncheckedCreateWithoutRouteInput>
  }

  export type ClientPermissionUpdateWithWhereUniqueWithoutRouteInput = {
    where: ClientPermissionWhereUniqueInput
    data: XOR<ClientPermissionUpdateWithoutRouteInput, ClientPermissionUncheckedUpdateWithoutRouteInput>
  }

  export type ClientPermissionUpdateManyWithWhereWithoutRouteInput = {
    where: ClientPermissionScalarWhereInput
    data: XOR<ClientPermissionUpdateManyMutationInput, ClientPermissionUncheckedUpdateManyWithoutRouteInput>
  }

  export type ClientPermissionScalarWhereInput = {
    AND?: ClientPermissionScalarWhereInput | ClientPermissionScalarWhereInput[]
    OR?: ClientPermissionScalarWhereInput[]
    NOT?: ClientPermissionScalarWhereInput | ClientPermissionScalarWhereInput[]
    id?: StringFilter<"ClientPermission"> | string
    clientId?: StringFilter<"ClientPermission"> | string
    routeId?: StringFilter<"ClientPermission"> | string
    scope?: EnumPermissionScopeFilter<"ClientPermission"> | $Enums.PermissionScope
  }

  export type ClientPermissionCreateWithoutClientInput = {
    id?: string
    scope?: $Enums.PermissionScope
    route: ServiceRouteCreateNestedOneWithoutPermissionsInput
  }

  export type ClientPermissionUncheckedCreateWithoutClientInput = {
    id?: string
    routeId: string
    scope?: $Enums.PermissionScope
  }

  export type ClientPermissionCreateOrConnectWithoutClientInput = {
    where: ClientPermissionWhereUniqueInput
    create: XOR<ClientPermissionCreateWithoutClientInput, ClientPermissionUncheckedCreateWithoutClientInput>
  }

  export type ClientPermissionCreateManyClientInputEnvelope = {
    data: ClientPermissionCreateManyClientInput | ClientPermissionCreateManyClientInput[]
    skipDuplicates?: boolean
  }

  export type ClientPermissionUpsertWithWhereUniqueWithoutClientInput = {
    where: ClientPermissionWhereUniqueInput
    update: XOR<ClientPermissionUpdateWithoutClientInput, ClientPermissionUncheckedUpdateWithoutClientInput>
    create: XOR<ClientPermissionCreateWithoutClientInput, ClientPermissionUncheckedCreateWithoutClientInput>
  }

  export type ClientPermissionUpdateWithWhereUniqueWithoutClientInput = {
    where: ClientPermissionWhereUniqueInput
    data: XOR<ClientPermissionUpdateWithoutClientInput, ClientPermissionUncheckedUpdateWithoutClientInput>
  }

  export type ClientPermissionUpdateManyWithWhereWithoutClientInput = {
    where: ClientPermissionScalarWhereInput
    data: XOR<ClientPermissionUpdateManyMutationInput, ClientPermissionUncheckedUpdateManyWithoutClientInput>
  }

  export type ClientAppCreateWithoutPermissionsInput = {
    id?: string
    name: string
    secret: string
    createdAt?: Date | string
  }

  export type ClientAppUncheckedCreateWithoutPermissionsInput = {
    id?: string
    name: string
    secret: string
    createdAt?: Date | string
  }

  export type ClientAppCreateOrConnectWithoutPermissionsInput = {
    where: ClientAppWhereUniqueInput
    create: XOR<ClientAppCreateWithoutPermissionsInput, ClientAppUncheckedCreateWithoutPermissionsInput>
  }

  export type ServiceRouteCreateWithoutPermissionsInput = {
    id?: string
    name: string
    method: $Enums.HttpMethod
    actualPath: string
    exposedPath: string
    createdAt?: Date | string
    service: ServiceCreateNestedOneWithoutRoutesInput
  }

  export type ServiceRouteUncheckedCreateWithoutPermissionsInput = {
    id?: string
    serviceId: string
    name: string
    method: $Enums.HttpMethod
    actualPath: string
    exposedPath: string
    createdAt?: Date | string
  }

  export type ServiceRouteCreateOrConnectWithoutPermissionsInput = {
    where: ServiceRouteWhereUniqueInput
    create: XOR<ServiceRouteCreateWithoutPermissionsInput, ServiceRouteUncheckedCreateWithoutPermissionsInput>
  }

  export type ClientAppUpsertWithoutPermissionsInput = {
    update: XOR<ClientAppUpdateWithoutPermissionsInput, ClientAppUncheckedUpdateWithoutPermissionsInput>
    create: XOR<ClientAppCreateWithoutPermissionsInput, ClientAppUncheckedCreateWithoutPermissionsInput>
    where?: ClientAppWhereInput
  }

  export type ClientAppUpdateToOneWithWhereWithoutPermissionsInput = {
    where?: ClientAppWhereInput
    data: XOR<ClientAppUpdateWithoutPermissionsInput, ClientAppUncheckedUpdateWithoutPermissionsInput>
  }

  export type ClientAppUpdateWithoutPermissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    secret?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientAppUncheckedUpdateWithoutPermissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    secret?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceRouteUpsertWithoutPermissionsInput = {
    update: XOR<ServiceRouteUpdateWithoutPermissionsInput, ServiceRouteUncheckedUpdateWithoutPermissionsInput>
    create: XOR<ServiceRouteCreateWithoutPermissionsInput, ServiceRouteUncheckedCreateWithoutPermissionsInput>
    where?: ServiceRouteWhereInput
  }

  export type ServiceRouteUpdateToOneWithWhereWithoutPermissionsInput = {
    where?: ServiceRouteWhereInput
    data: XOR<ServiceRouteUpdateWithoutPermissionsInput, ServiceRouteUncheckedUpdateWithoutPermissionsInput>
  }

  export type ServiceRouteUpdateWithoutPermissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    actualPath?: StringFieldUpdateOperationsInput | string
    exposedPath?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    service?: ServiceUpdateOneRequiredWithoutRoutesNestedInput
  }

  export type ServiceRouteUncheckedUpdateWithoutPermissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    actualPath?: StringFieldUpdateOperationsInput | string
    exposedPath?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceRouteCreateManyServiceInput = {
    id?: string
    name: string
    method: $Enums.HttpMethod
    actualPath: string
    exposedPath: string
    createdAt?: Date | string
  }

  export type ServiceRouteUpdateWithoutServiceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    actualPath?: StringFieldUpdateOperationsInput | string
    exposedPath?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: ClientPermissionUpdateManyWithoutRouteNestedInput
  }

  export type ServiceRouteUncheckedUpdateWithoutServiceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    actualPath?: StringFieldUpdateOperationsInput | string
    exposedPath?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: ClientPermissionUncheckedUpdateManyWithoutRouteNestedInput
  }

  export type ServiceRouteUncheckedUpdateManyWithoutServiceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    method?: EnumHttpMethodFieldUpdateOperationsInput | $Enums.HttpMethod
    actualPath?: StringFieldUpdateOperationsInput | string
    exposedPath?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientPermissionCreateManyRouteInput = {
    id?: string
    clientId: string
    scope?: $Enums.PermissionScope
  }

  export type ClientPermissionUpdateWithoutRouteInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
    client?: ClientAppUpdateOneRequiredWithoutPermissionsNestedInput
  }

  export type ClientPermissionUncheckedUpdateWithoutRouteInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
  }

  export type ClientPermissionUncheckedUpdateManyWithoutRouteInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
  }

  export type ClientPermissionCreateManyClientInput = {
    id?: string
    routeId: string
    scope?: $Enums.PermissionScope
  }

  export type ClientPermissionUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
    route?: ServiceRouteUpdateOneRequiredWithoutPermissionsNestedInput
  }

  export type ClientPermissionUncheckedUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    routeId?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
  }

  export type ClientPermissionUncheckedUpdateManyWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    routeId?: StringFieldUpdateOperationsInput | string
    scope?: EnumPermissionScopeFieldUpdateOperationsInput | $Enums.PermissionScope
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}