# fnky-notifcations

https://github.com/fnkybot/fnky-notifcations/assets/89311306/a2e93cba-faba-42fa-9a76-bb73e971418c

## Description

Not bad notifcations plugin for Athena Framework compatible with `5.0.0+` of the [Athena Framework](https://athenaframework.com/).

-   Features
    -   Custom titles, icons and colours of notifitacions
    -   **History of notifications (/history in console)**
    -   Config file
    -   Duration progress bars
    -   Responsive
    -   Emoji support
    -   Notification sound
    -   HTML code in notification's message
    -   TS / VueJS

## Getting Started

### Dependencies

-   Athena Framework, TS and VueJS.

### Installing

-   Clone Repository (https://github.com/fnkybot/fnky-notifcations.git) directly into src/core/plugins.

### Usage

-  Serverside:
  ```ts
import { NotifyController } from '@AthenaPlugins/fnky-notifications/server';
NotifyController.send(player, 2, 5,'Success','Lorem ipsum dolor sit amet, adipiscing elit, <b><font color="#3DBA39">sed do eiusmod</b></font>');
NotifyController.clearAll(player); // to clear history or/and notifications on screen
```

-  Clientside:
  ```ts
import { sendNotification, clearAll } from '@AthenaPlugins/fnky-notifications/client';
sendNotification(player, 2, 5,'Success','Lorem ipsum dolor sit amet, adipiscing elit, <b><font color="#3DBA39">sed do eiusmod</b></font>');
clearAll();
```

-  Console in-game:
  /history

## Help

If u need my help send me a massage on discord - r.eal.

## Contribute to this plugin

Feel free to contribute to this project or report bugs, it's open source!

## Authors & Contributors

-   Author
    -   Real!
-   Special thanks to cptprice1139

## License

This project is licensed under the [MIT] License.

## Links

-   [Athena Framework](https://athenaframework.com/)
