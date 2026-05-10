package com.varad.directchat;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;
public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // This registers your custom plugin so the web app can "talk" to it
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      add(CallLogPlugin.class);
    }});
  }
}