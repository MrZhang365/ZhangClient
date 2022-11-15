interface PageViewEvent {
    type: 'pageview';
    url: string;
}
declare type IEvent = PageViewEvent;
declare type BeforeSend = (event: IEvent) => IEvent | null;
interface AnalyticsProps {
    beforeSend?: BeforeSend;
    debug?: boolean;
}
declare global {
    interface Window {
        va?: (event: string, properties?: unknown) => void;
        vaq?: [string, unknown?][];
        vai?: boolean;
    }
}

declare function Analytics({ beforeSend, debug, }: AnalyticsProps): null;

export { Analytics };
