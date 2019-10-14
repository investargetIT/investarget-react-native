修改`node_modules/react-native-root-siblings/lib/AppRegistryInjection.js`文件，将`import EventEmitter from 'react-native/Libraries/EventEmitter/EventEmitter';`改为`import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';`

修改`src/easemob/Lib/WebIM.js`文件，将25行代码`function ts() {`改为`let ts = function() {`

解决 Android 上 Toast "action - onAliasOperatorResult, sequence:..." 之类的信息这一问题，修改`node_modules/jpush-react-native/android/src/main/java/cn/jpush/reactnativejpush/JPushModule.java`文件，在617行左右的`onAliasOperationResult()`方法中，删除或comment掉`Logger.toast(context, log);`这行代码。

https://github.com/flare216/react-native-install-apk/commit/33e7ea1a3edff6c34e75fdca455edba5a4dfd22f

如果碰到一个和`third-party`有关的错误的话，以下链接可能会有帮助：
https://github.com/facebook/react-native/issues/19529#issuecomment-423898864

如果碰到`file not found`这类错误的话，参考以下链接：
https://github.com/facebook/react-native/issues/11721#issuecomment-270672904

如果碰到 **can not find simulator** 这类错误的话，编辑`node_modules/react-native/local-cli/runIOS/findMatchingSimulator.js`文件，将其中有类似`version.indexOf('iOS') === -1`的一行代码改为`!version.inculdes('iOS')`，可以参考：https://github.com/facebook/react-native/issues/23282#issuecomment-476439080

升级了Xcode后，遇到`Exception '*** -[__NSArrayM objectAtIndexedSubscript:]: index 1 beyond bounds [0 .. 0]' was thrown while invoking getCurrentAppState on target AppState with params`，解决办法：https://github.com/facebook/react-native/issues/25154#issuecomment-534024991

# Generate signed Android apk
To generate signed Android apk, run:
```
cd android && ./gradlew assembleRelease
```
it will be generated at:
```
android/app/build/outputs/apk/app-release.apk
```
test it on device:
```
react-native run-android --variant=release
```