修改`node_modules/react-native-root-siblings/lib/AppRegistryInjection.js`文件，将`import EventEmitter from 'react-native/Libraries/EventEmitter/EventEmitter';`改为`import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';`

修改`src/easemob/Lib/WebIM.js`文件，将25行代码`function ts() {`改为`let ts = function() {`

解决 Android 上 Toast "action - onAliasOperatorResult, sequence:..." 之类的信息这一问题，修改`node_modules/jpush-react-native/android/src/main/java/cn/jpush/reactnativejpush/JPushModule.java`文件，在617行左右的`onAliasOperationResult()`方法中，删除或comment掉`Logger.toast(context, log);`这行代码。

https://github.com/flare216/react-native-install-apk/commit/33e7ea1a3edff6c34e75fdca455edba5a4dfd22f

如果碰到一个和`third-party`有关的错误的话，以下链接可能会有帮助：
https://github.com/facebook/react-native/issues/19529#issuecomment-423898864
