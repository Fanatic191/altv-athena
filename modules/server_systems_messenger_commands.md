---
title: Athena.systems.messenger.commands
outline: [1,3]
order: 0
---

# {{ $frontmatter.title }}


## Variables

### default

• **default**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `execute` | (`player`: `Player`, `commandName`: `string`, `args`: `any`[]) => `any` |
| `get` | (`commandName`: `string`) => `any` |
| `getCommands` | (`player`: `Player`) => [`player`](server_config.md#player)[] |
| `populateCommands` | (`player`: `Player`) => `any` |
| `register` | (`name`: `string`, `desc`: `string`, `perms`: `string`[], `callback`: `CommandCallback`<`Player`\>, `isCharacterPermission`: `boolean`) => `any` |

#### Defined in

[server/systems/messenger/commands.ts:168](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L168)

## Functions

### execute

::: tip Usage
Athena.systems.messenger.commands.**execute**(`player`, `commandName`, `args`): `any`
:::

Used to execute a command by name.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `player` | `Player` | An alt:V Player Entity |
| `commandName` | `string` |  |
| `args` | `any`[] |  |

#### Returns

`any`

#### Defined in

[server/systems/messenger/commands.ts:19](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L19)

___

### get

::: tip Usage
Athena.systems.messenger.commands.**get**(`commandName`): `any`
:::

Get command information by command name.

#### Parameters

| Name | Type |
| :------ | :------ |
| `commandName` | `string` |

#### Returns

`any`

#### Defined in

[server/systems/messenger/commands.ts:46](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L46)

___

### getCommands

::: tip Usage
Athena.systems.messenger.commands.**getCommands**(`player`): [`player`](server_config.md#player)[]
:::

Get all commands the player has access to.
Includes names of individual parameters for each callback function as well.
Excludes callbacks.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `player` | `Player` | An alt:V Player Entity |

#### Returns

[`player`](server_config.md#player)[]

#### Defined in

[server/systems/messenger/commands.ts:127](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L127)

___

### override

::: tip Usage
Athena.systems.messenger.commands.**override**(`functionName`, `callback`): `any`
:::

Used to override command functionality

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"execute"`` |
| `callback` | (`player`: `Player`, `commandName`: `string`, `args`: `any`[]) => `any` |

#### Returns

`any`

#### Defined in

[server/systems/messenger/commands.ts:180](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L180)

::: tip Usage
Athena.systems.messenger.commands.**override**(`functionName`, `callback`): `any`
:::

Used to override command functionality

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"get"`` |
| `callback` | (`commandName`: `string`) => `any` |

#### Returns

`any`

#### Defined in

[server/systems/messenger/commands.ts:181](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L181)

::: tip Usage
Athena.systems.messenger.commands.**override**(`functionName`, `callback`): `any`
:::

Used to override command functionality

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"getCommands"`` |
| `callback` | (`player`: `Player`) => [`player`](server_config.md#player)[] |

#### Returns

`any`

#### Defined in

[server/systems/messenger/commands.ts:182](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L182)

::: tip Usage
Athena.systems.messenger.commands.**override**(`functionName`, `callback`): `any`
:::

Used to override command functionality

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"populateCommands"`` |
| `callback` | (`player`: `Player`) => `any` |

#### Returns

`any`

#### Defined in

[server/systems/messenger/commands.ts:183](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L183)

::: tip Usage
Athena.systems.messenger.commands.**override**(`functionName`, `callback`): `any`
:::

Used to override command functionality

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"register"`` |
| `callback` | (`name`: `string`, `desc`: `string`, `perms`: `string`[], `callback`: `CommandCallback`<`Player`\>, `isCharacterPermission`: `boolean`) => `any` |

#### Returns

`any`

#### Defined in

[server/systems/messenger/commands.ts:184](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L184)

___

### populateCommands

::: tip Usage
Athena.systems.messenger.commands.**populateCommands**(`player`): `any`
:::

Get all commands that are associated with a player's current permission level.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `player` | `Player` | An alt:V Player Entity |

#### Returns

`any`

#### Defined in

[server/systems/messenger/commands.ts:86](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L86)

___

### register

::: tip Usage
Athena.systems.messenger.commands.**register**(`name`, `desc`, `perms`, `callback`, `isCharacterPermission?`): `any`
:::

Register a new command that can be called.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `desc` | `string` | `undefined` |
| `perms` | `string`[] | `undefined` |
| `callback` | `CommandCallback`<`Player`\> | `undefined` |
| `isCharacterPermission` | `boolean` | `false` |

#### Returns

`any`

#### Defined in

[server/systems/messenger/commands.ts:59](https://github.com/Stuyk/altv-athena/blob/2226a0a/src/core/server/systems/messenger/commands.ts#L59)
