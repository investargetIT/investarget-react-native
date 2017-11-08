package com.investargetnative.modules.actionsheet;

import android.app.AlertDialog;
import android.content.DialogInterface;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.util.ArrayList;

/**
 * Created by movier on 08/11/2017.
 */

public class ActionSheet extends ReactContextBaseJavaModule {

    public ActionSheet(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ActionSheet";
    }

    @ReactMethod
    public void showActionSheetWithOptions(ReadableMap options, final Callback callback) {

        String title = options.getString("title");
        ArrayList<Object> choices = options.getArray("options").toArrayList();

        new AlertDialog.Builder(getCurrentActivity())
                .setTitle(title)
                .setItems(choices.toArray(new String[choices.size()]), new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
                        callback.invoke(which);
                    }
                })
                .setNegativeButton("取消", null)
                .show();
    }
}
