package com.varad.directchat;

import android.Manifest;
import android.database.Cursor;
import android.provider.CallLog;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import org.json.JSONArray;

@CapacitorPlugin(
    name = "CallLog",
    permissions = {
        @Permission(
            alias = "readCallLog",
            strings = {Manifest.permission.READ_CALL_LOG}
        )
    }
)
public class CallLogPlugin extends Plugin {

    @PluginMethod
    public void getCallLogs(PluginCall call) {
        if (getPermissionState("readCallLog") != PermissionState.GRANTED) {
            requestPermissionForAlias("readCallLog", call, "callLogCallback");
        } else {
            fetchCallLogs(call);
        }
    }

    @PermissionCallback
    private void callLogCallback(PluginCall call) {
        if (getPermissionState("readCallLog") == PermissionState.GRANTED) {
            fetchCallLogs(call);
        } else {
            call.reject("Permission required");
        }
    }

    private void fetchCallLogs(PluginCall call) {
        JSONArray logs = new JSONArray();
        try (Cursor cursor = getContext().getContentResolver().query(
            CallLog.Calls.CONTENT_URI, null, null, null, CallLog.Calls.DATE + " DESC"
        )) {
            if (cursor != null) {
                int numberCol = cursor.getColumnIndex(CallLog.Calls.NUMBER);
                int typeCol = cursor.getColumnIndex(CallLog.Calls.TYPE);
                int dateCol = cursor.getColumnIndex(CallLog.Calls.DATE);

                int count = 0;
                while (cursor.moveToNext() && count < 20) {
                    JSObject log = new JSObject();
                    log.put("number", cursor.getString(numberCol));
                    log.put("type", cursor.getInt(typeCol));
                    log.put("date", cursor.getLong(dateCol));
                    logs.put(log);
                    count++;
                }
            }
        } catch (Exception e) {
            call.reject("Failed to fetch call logs: " + e.getMessage());
            return;
        }
        
        JSObject result = new JSObject();
        result.put("logs", logs);
        call.resolve(result);
    }
}
